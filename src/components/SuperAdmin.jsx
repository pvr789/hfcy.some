import { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Check, IdCard, LayoutGrid, ListOrdered, Lock, LogOut, MonitorCheck, Pencil, Trash2, User, UserPlus, Users, X } from 'lucide-react';
import { FIXED_MODULES } from '../lib/constants';
import { formatRut, formatRutDisplay, formatTurn, nextTurn, rutToEmail } from '../lib/utils';
import { configRef, statusRef, occupyModule, freeModule, freeAllModules } from '../lib/modules';
import { describeSchedule } from '../lib/schedule';
import { AreaContext } from '../lib/theme';
import useModulesStatus from '../hooks/useModulesStatus';
import useSystemStatus from '../hooks/useSystemStatus';
import AppHeader from './AppHeader';
import ManualTurnCard from './ManualTurnCard';
import SystemSchedule from './SystemSchedule';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Alert from './ui/Alert';
import Avatar from './ui/Avatar';
import Toggle from './ui/Toggle';
import { Card, CardHeader } from './ui/Card';
import { Input, Label, Select } from './ui/Field';

// App secundaria de Firebase: permite crear operadores sin cerrar la sesión del admin.
const getSecondaryAuth = () => {
  const app = getApps().find((a) => a.name === 'SecondaryApp') || initializeApp(firebaseConfig, 'SecondaryApp');
  return getAuth(app);
};

// Módulo que ocupa un usuario (se guarda por RUT o, en datos antiguos, por uid).
const findUserModule = (modulesStatus, user) =>
  FIXED_MODULES.find((m) => {
    const id = modulesStatus[m.id]?.activeOperatorId;
    return id && (id === user.rut || id === user.id);
  });

export default function SuperAdmin({ onLogout }) {
  const [users, setUsers] = useState([]);
  const modulesStatus = useModulesStatus();
  const system = useSystemStatus();
  const isSystemOpen = system.manualOpen; // interruptor de Jefatura
  const closedBySchedule = system.loaded && system.manualOpen && !system.inSchedule;

  const [newUserRut, setNewUserRut] = useState('');
  const [newUserRutConfirm, setNewUserRutConfirm] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [globalTurn, setGlobalTurn] = useState({ letter: 'A', number: 0 });

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editModuleId, setEditModuleId] = useState('none');

  // A la hora de cierre (o si el panel se abre ya fuera de horario) se liberan los módulos ocupados,
  // igual que con el cierre manual. Los operadores conectados además se desconectan solos.
  useEffect(() => {
    if (closedBySchedule) freeAllModules().catch((err) => console.error(err));
  }, [closedBySchedule]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const u = [];
      snap.forEach((document) => {
        u.push({ id: document.id, ...document.data() });
      });
      setUsers(u);
    });

    const unsubConfig = onSnapshot(configRef(), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGlobalTurn({
          letter: data.globalTurnLetter || 'A',
          number: data.globalTurnNumber !== undefined ? data.globalTurnNumber : 0,
        });
      }
    });

    return () => {
      unsub();
      unsubConfig();
    };
  }, []);

  // Mensaje de éxito que se oculta solo; los errores quedan hasta la siguiente acción.
  const notify = (message) => {
    setError(null);
    setSuccess(message);
    setTimeout(() => setSuccess(null), 4000);
  };

  const resetNewUserForm = () => {
    setNewUserRut('');
    setNewUserRutConfirm('');
    setNewUserName('');
    setNewUserPassword('');
    setNewUserPasswordConfirm('');
  };

  const handleToggleSystemStatus = async () => {
    const newState = !isSystemOpen;
    const { schedule } = system;
    let text = `¿Estás seguro de que deseas ${newState ? 'ABRIR' : 'CERRAR'} el sistema?`;
    if (!newState) {
      text += '\n\nSi lo cierras, todos los operadores serán desconectados inmediatamente.';
      if (schedule.enabled) text += '\nMientras esté cerrado, el horario no lo abrirá: tendrás que volver a abrirlo con este interruptor.';
    } else if (schedule.enabled && !system.inSchedule) {
      text += `\n\nAhora está fuera de horario: los operadores podrán ingresar a partir de las ${schedule.open}.`;
    }
    if (!window.confirm(text)) return;

    try {
      await setDoc(statusRef(), { isOpen: newState }, { merge: true });
      // Al cerrar, libera todos los módulos que tengan un operador asignado
      if (!newState) await freeAllModules();
      notify(`Sistema ${newState ? 'abierto' : 'cerrado'}.`);
    } catch (err) {
      console.error(err);
      setError('Error al cambiar estado del sistema.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const rutClean = newUserRut.trim();
    const rutConfirmClean = newUserRutConfirm.trim();
    if (!rutClean) {
      setLoading(false);
      return;
    }

    if (rutClean !== rutConfirmClean) {
      setError('Los RUT ingresados no coinciden.');
      setLoading(false);
      return;
    }

    const existingUser = users.find((u) => u.rut === rutClean);
    if (existingUser) {
      // Editar usuario existente
      if (!newUserName.trim()) {
        setError('Ingresa el nombre para actualizarlo.');
        setLoading(false);
        return;
      }
      try {
        await updateDoc(doc(db, 'users', existingUser.id), { name: newUserName });
        notify(`Nombre actualizado para el RUT ${formatRutDisplay(rutClean)}.`);
        resetNewUserForm();
      } catch (err) {
        console.error(err);
        setError('Error al actualizar nombre.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (newUserPassword !== newUserPasswordConfirm) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const secondaryAuth = getSecondaryAuth();
      const loginEmail = rutToEmail(rutClean);
      let newUid;

      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, loginEmail, newUserPassword);
        newUid = userCredential.user.uid;
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          try {
            const loginCred = await signInWithEmailAndPassword(secondaryAuth, loginEmail, newUserPassword);
            newUid = loginCred.user.uid;
          } catch {
            throw new Error('restoration-failed');
          }
        } else {
          throw createErr;
        }
      }

      await secondaryAuth.signOut();

      await setDoc(doc(db, 'users', newUid), {
        rut: rutClean,
        name: newUserName,
        role: 'operator',
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      notify(`Operador ${newUserName} creado con éxito.`);
      resetNewUserForm();
    } catch (err) {
      console.error(err);
      let errorMsg = 'Ocurrió un error inesperado.';
      if (err.message === 'restoration-failed') errorMsg = 'El RUT ya existe oculto. Para restaurarlo ingresa su contraseña original.';
      else if (err.code === 'auth/email-already-in-use') errorMsg = 'El RUT ya está registrado.';
      else if (err.code === 'auth/weak-password') errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      else if (err.code === 'auth/invalid-email') errorMsg = 'El RUT ingresado no es válido.';
      else errorMsg = err.message || 'Error desconocido';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeModule = async (moduleId, moduleName) => {
    if (!window.confirm(`¿Liberar el ${moduleName}? Desconectará al operador actual.`)) return;
    try {
      await freeModule(moduleId);
      notify(`${moduleName} liberado.`);
    } catch (err) {
      console.error(err);
      setError('Error al liberar módulo.');
    }
  };

  const handleDeleteUser = async (uid, name) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al operador "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      notify(`Operador ${name} eliminado.`);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar usuario.');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditIsActive(user.isActive !== false);
    const occupiedModule = findUserModule(modulesStatus, user);
    setEditModuleId(occupiedModule ? occupiedModule.id : 'none');
  };

  const closeEditModal = () => setEditingUser(null);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateDoc(doc(db, 'users', editingUser.id), { name: editName, isActive: editIsActive });

      const finalModuleId = editIsActive ? editModuleId : 'none';
      const prevModule = findUserModule(modulesStatus, editingUser);

      if (prevModule && prevModule.id !== finalModuleId) {
        await freeModule(prevModule.id);
      }
      if (finalModuleId !== 'none' && (!prevModule || prevModule.id !== finalModuleId)) {
        await occupyModule(finalModuleId, editingUser.rut, editName);
      }

      notify(`Operador ${editName} actualizado.`);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setError('Error al actualizar operador.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (uid, currentState, rut) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isActive: !currentState });
      if (currentState === true) {
        const mod = findUserModule(modulesStatus, { id: uid, rut });
        if (mod) await freeModule(mod.id);
      }
    } catch (err) {
      console.error(err);
      setError('Error al cambiar estado del usuario.');
    }
  };

  // ---------- Datos para la vista ----------
  const operators = users
    .filter((u) => u.role !== 'superuser')
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
  const enabledCount = operators.filter((u) => u.isActive !== false).length;
  const busyCount = FIXED_MODULES.filter((m) => modulesStatus[m.id]?.activeOperatorId).length;
  const upcoming = nextTurn(globalTurn.letter, globalTurn.number);

  return (
    <AreaContext.Provider value="admin">
      <div className="ui-root flex min-h-screen flex-col bg-slate-50">
        {/* La cabecera va fuera de la franja negra para que quede fija al hacer scroll */}
        <AppHeader onLogout={onLogout}>
          <SystemSwitch isOpen={isSystemOpen} outOfHours={closedBySchedule} onToggle={handleToggleSystemStatus} />
        </AppHeader>

        {/* Franja negra: título y resumen */}
        <div className="bg-slate-950">
          <div className="relative mx-auto max-w-[1440px] px-6 pb-8 pt-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Jefatura · SOME</p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white">Panel de administración</h1>
            <p className="mt-1 text-sm text-slate-400">Controla la fila de atención, los módulos y el personal.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat icon={ListOrdered} label="Fila global" value={formatTurn(globalTurn.letter, globalTurn.number)} display detail={`Próximo turno: ${formatTurn(upcoming.letter, upcoming.number)}`} />
              <Stat icon={LayoutGrid} label="Módulos en atención" value={`${busyCount} / ${FIXED_MODULES.length}`} progress={busyCount / FIXED_MODULES.length} detail={`${FIXED_MODULES.length - busyCount} disponibles`} />
              <Stat icon={Users} label="Operadores habilitados" value={`${enabledCount} / ${operators.length}`} progress={operators.length ? enabledCount / operators.length : 0} detail={operators.length - enabledCount ? `${operators.length - enabledCount} inhabilitado(s)` : 'Todos habilitados'} />
            </div>
          </div>
        </div>

        <main className="ui-fade-up mx-auto w-full max-w-[1440px] flex-1 space-y-10 px-6 py-8 lg:px-8">
          {!isSystemOpen && (
            <Alert tone="warning">El sistema está cerrado: los operadores no pueden ingresar hasta que lo vuelvas a abrir.</Alert>
          )}
          {closedBySchedule && (
            <Alert tone="warning">
              Fuera de horario: el sistema atiende {describeSchedule(system.schedule)}. Los operadores podrán ingresar a partir de las {system.schedule.open}.
            </Alert>
          )}
          {(error || success) && <Alert tone={error ? 'error' : 'success'}>{error || success}</Alert>}

          {/* Atención */}
          <section>
            <SectionHeading title="Atención" description="Estado de los módulos y ajuste de la fila." />
            <div className="grid gap-6 lg:grid-cols-12">
              <Card className="overflow-hidden lg:col-span-7">
                <CardHeader icon={MonitorCheck} title="Módulos de atención" description="Quién está atendiendo en cada módulo." action={<Badge tone={busyCount ? 'success' : 'neutral'} dot>{busyCount} en atención</Badge>} />
                <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                  {FIXED_MODULES.map((mod) => (
                    <ModuleRow key={mod.id} mod={mod} status={modulesStatus[mod.id]} onFree={() => handleFreeModule(mod.id, mod.name)} />
                  ))}
                </ul>
              </Card>
              <ManualTurnCard className="lg:col-span-5" currentLetter={globalTurn.letter} currentNumber={globalTurn.number}>
                <SystemSchedule schedule={system.schedule} />
              </ManualTurnCard>
            </div>
          </section>

          {/* Personal */}
          <section>
            <SectionHeading title="Personal" description="Cuentas de los operadores del SOME." />
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Misma altura que la lista de operadores: los campos se reparten y el botón queda abajo */}
              <Card className="flex flex-col lg:col-span-5">
                <CardHeader icon={UserPlus} title="Nuevo operador" description="Si el RUT ya existe, solo se actualiza el nombre." />
                <form className="flex flex-1 flex-col justify-between gap-4 px-6 pb-6 pt-5" onSubmit={handleCreateUser}>
                  <div>
                    <Label htmlFor="nu-name">Nombre completo</Label>
                    <Input id="nu-name" icon={User} required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Ej. Daniela Pérez" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="nu-rut">RUT</Label>
                      <Input id="nu-rut" icon={IdCard} required maxLength={10} value={newUserRut} onChange={(e) => setNewUserRut(formatRut(e.target.value))} placeholder="12345678-9" />
                    </div>
                    <div>
                      <Label htmlFor="nu-rut2">Repetir RUT</Label>
                      <Input id="nu-rut2" required maxLength={10} value={newUserRutConfirm} onChange={(e) => setNewUserRutConfirm(formatRut(e.target.value))} placeholder="12345678-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="nu-pass" hint="mín. 6">Contraseña</Label>
                      <Input id="nu-pass" icon={Lock} type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} autoComplete="new-password" />
                    </div>
                    <div>
                      <Label htmlFor="nu-pass2">Repetir contraseña</Label>
                      <Input id="nu-pass2" type="password" value={newUserPasswordConfirm} onChange={(e) => setNewUserPasswordConfirm(e.target.value)} autoComplete="new-password" />
                    </div>
                  </div>
                  <Button type="submit" size="lg" block disabled={loading} className="mt-2">
                    <UserPlus size={18} />
                    {loading ? 'Procesando…' : 'Guardar operador'}
                  </Button>
                </form>
              </Card>

              <Card className="overflow-hidden lg:col-span-7">
                <CardHeader icon={Users} title="Operadores registrados" description="Habilita, edita o elimina cuentas." action={<Badge>{operators.length} en total</Badge>} />
                <ul className="custom-scrollbar mt-4 max-h-[440px] divide-y divide-slate-100 overflow-y-auto border-t border-slate-100">
                  {operators.map((user) => (
                    <OperatorRow
                      key={user.id}
                      user={user}
                      module={findUserModule(modulesStatus, user)}
                      onToggle={() => handleToggleActive(user.id, user.isActive !== false, user.rut)}
                      onEdit={() => openEditModal(user)}
                      onDelete={() => handleDeleteUser(user.id, user.name)}
                    />
                  ))}
                  {operators.length === 0 && <li className="px-6 py-10 text-center text-sm text-slate-500">Aún no hay operadores registrados.</li>}
                </ul>
              </Card>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
          Hospital de la Familia y Comunidad de Yumbel © 2026 · Sistema de Turnos SOME v1.0
        </footer>

        {editingUser && (
          <div className="ui-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={closeEditModal}>
            <div role="dialog" aria-modal="true" aria-labelledby="edit-title" className="ui-fade-up w-full max-w-lg rounded-2xl bg-white shadow-pop ring-1 ring-slate-900/5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <Avatar name={editName || editingUser.name} size="lg" />
                  <div>
                    <h3 id="edit-title" className="text-base font-semibold text-slate-900">Editar operador</h3>
                    <p className="text-sm text-slate-500">RUT {formatRutDisplay(editingUser.rut)}</p>
                  </div>
                </div>
                <button type="button" onClick={closeEditModal} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>
              <form className="space-y-4 px-6 py-5" onSubmit={handleSaveEdit}>
                <div>
                  <Label htmlFor="ed-name">Nombre del funcionario</Label>
                  <Input id="ed-name" icon={User} required value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ed-state">Estado de acceso</Label>
                    <Select id="ed-state" value={editIsActive ? 'activo' : 'inhabilitado'} onChange={(e) => setEditIsActive(e.target.value === 'activo')}>
                      <option value="activo">Habilitado</option>
                      <option value="inhabilitado">Inhabilitado</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ed-module">Módulo asignado</Label>
                    <Select id="ed-module" value={editModuleId} onChange={(e) => setEditModuleId(e.target.value)}>
                      <option value="none">Sin asignar</option>
                      {FIXED_MODULES.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-slate-500">El RUT no se puede modificar. Si cambió, crea una cuenta nueva.</p>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                  <Button variant="secondary" onClick={closeEditModal}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>
                    <Check size={16} />
                    {loading ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AreaContext.Provider>
  );
}

// ---------- Piezas del panel ----------

// Interruptor de Jefatura. Encendido pero fuera del horario: "Fuera de horario" en ámbar.
const SWITCH_STATES = {
  open: { text: 'Sistema abierto', dot: 'bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]', tone: 'success' },
  waiting: { text: 'Fuera de horario', dot: 'bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]', tone: 'warning' },
  closed: { text: 'Sistema cerrado', dot: 'bg-slate-500', tone: 'success' },
};

function SystemSwitch({ isOpen, outOfHours, onToggle }) {
  const state = SWITCH_STATES[!isOpen ? 'closed' : outOfHours ? 'waiting' : 'open'];
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 py-1.5 pl-3 pr-2 ring-1 ring-inset ring-white/10">
      <span className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-white">
        <span className={`h-2 w-2 rounded-full ${state.dot}`} />
        {state.text}
      </span>
      <Toggle checked={isOpen} onChange={onToggle} tone={state.tone} dark label="Abrir o cerrar el sistema" />
    </div>
  );
}

function Stat({ icon, label, value, detail, progress, display = false }) {
  const Icon = icon;
  return (
    <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-inset ring-white/10">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</span>
        <Icon size={16} />
      </div>
      <p className={`mt-3 text-3xl font-semibold tracking-tight text-white ${display ? 'font-display' : ''}`}>{value}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div className="mb-4 flex items-baseline gap-3 px-1">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

function ModuleRow({ mod, status, onFree }) {
  const busy = !!status?.activeOperatorId;
  return (
    <li className="flex items-center gap-4 px-6 py-3.5">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-lg font-bold ${busy ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-400'}`}>{mod.letter}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{mod.name}</p>
        <p className="truncate text-[13px] text-slate-500">{busy ? status.activeOperatorName : 'Sin operador'}</p>
      </div>
      <div className="hidden w-20 text-right sm:block">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Último</p>
        <p className="font-display text-sm font-semibold text-slate-700">{status?.number ? formatTurn(status.letter, status.number) : '—'}</p>
      </div>
      <div className="w-[104px] shrink-0">
        <Badge tone={busy ? 'success' : 'neutral'} dot>{busy ? 'Atendiendo' : 'Disponible'}</Badge>
      </div>
      <div className="flex w-[92px] shrink-0 justify-end">
        {busy && (
          <Button variant="secondary" size="sm" onClick={onFree} title={`Liberar ${mod.name}`}>
            <LogOut size={14} />
            Liberar
          </Button>
        )}
      </div>
    </li>
  );
}

function OperatorRow({ user, module, onToggle, onEdit, onDelete }) {
  const isActive = user.isActive !== false;
  return (
    <li className={`flex items-center gap-4 px-6 py-3.5 ${isActive ? '' : 'bg-slate-50/70'}`}>
      <Avatar name={user.name} tone={isActive ? 'dark' : 'muted'} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`truncate text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{user.name}</p>
          {module && <Badge tone="success" dot>En turno</Badge>}
          {!isActive && <Badge tone="neutral">Inhabilitado</Badge>}
        </div>
        <p className="mt-0.5 text-[13px] text-slate-500">
          RUT {formatRutDisplay(user.rut)}
          {module ? ` · ${module.name}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Toggle checked={isActive} onChange={onToggle} label={isActive ? `Inhabilitar a ${user.name}` : `Habilitar a ${user.name}`} />
        <span className="mx-1.5 h-5 w-px bg-slate-200" />
        <button type="button" onClick={onEdit} title="Editar operador" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900">
          <Pencil size={16} />
        </button>
        <button type="button" onClick={onDelete} title="Eliminar operador" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
