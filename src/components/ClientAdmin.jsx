import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getDoc, doc, updateDoc, onSnapshot, addDoc, runTransaction } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ArrowRight, LoaderCircle, LogOut, PictureInPicture2, Repeat, UserX, Volume2, VolumeX } from 'lucide-react';
import { FIXED_MODULES } from '../lib/constants';
import { formatTurn, nextTurn } from '../lib/utils';
import { moduleRef, configRef, callsHistoryRef, occupyModule, freeModule } from '../lib/modules';
import { AREAS, AreaContext, useArea } from '../lib/theme';
import useModulesStatus from '../hooks/useModulesStatus';
import AppHeader from './AppHeader';
import ManualTurnCard from './ManualTurnCard';
import LoadingScreen from './ui/LoadingScreen';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Toggle from './ui/Toggle';
import { Card, CardHeader } from './ui/Card';
import { Label } from './ui/Field';

const COOLDOWN_MS = 3000;
const LANGUAGES = [['es', 'Español'], ['en', 'Inglés']];
const OPERATOR = AREAS.operator;

export default function ClientAdmin({ onLogout }) {
  const [operator, setOperator] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [globalQueue, setGlobalQueue] = useState({ audioEnabled: true, audioLanguage: 'es' });
  const [moduleState, setModuleState] = useState({ letter: 'A', number: 0 });
  const [loading, setLoading] = useState(true);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [pipWindow, setPipWindow] = useState(null);
  const modulesStatus = useModulesStatus();

  // Perfil del operador
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      onLogout();
      return;
    }
    getDoc(doc(db, 'users', uid))
      .then((snap) => { if (snap.exists()) setOperator({ id: uid, ...snap.data() }); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [onLogout]);

  // Configuración global (fila, audio, idioma)
  useEffect(() => onSnapshot(configRef(), (snap) => {
    if (snap.exists()) setGlobalQueue(snap.data());
  }), []);

  // Estado del módulo seleccionado
  useEffect(() => {
    if (!selectedModule) return;
    return onSnapshot(moduleRef(selectedModule.id), (snap) => {
      if (snap.exists()) setModuleState(snap.data());
    });
  }, [selectedModule]);

  const operatorKey = operator ? (operator.rut || operator.id) : null;

  const startCooldown = () => {
    setIsCoolingDown(true);
    setTimeout(() => setIsCoolingDown(false), COOLDOWN_MS);
  };

  // Registra un llamado: el visor lo muestra y, si la voz está activa, lo anuncia.
  // timestamp en milisegundos (número, Date.now()): el visor ordena el historial por este campo.
  const announceCall = (letter, number) => addDoc(callsHistoryRef(), {
    letter,
    number,
    moduleName: selectedModule.name,
    moduleId: selectedModule.id,
    timestamp: Date.now(),
  });

  const updateConfig = (data) => updateDoc(configRef(), data).catch(console.error);

  const repeatAudio = async () => {
    if (!selectedModule || !globalQueue.audioEnabled || isCoolingDown) return;
    try {
      await announceCall(moduleState.letter, moduleState.number);
      startCooldown();
    } catch (err) {
      console.error(err);
    }
  };

  const advanceTurn = async () => {
    if (!selectedModule || isCoolingDown) return;
    try {
      const next = await runTransaction(db, async (tx) => {
        const globalSnap = await tx.get(configRef());
        if (!globalSnap.exists()) throw new Error('No existe system/config');
        const data = globalSnap.data();
        const turn = nextTurn(data.globalTurnLetter || 'A', data.globalTurnNumber ?? 0);
        tx.update(configRef(), { globalTurnNumber: turn.number, globalTurnLetter: turn.letter });
        tx.set(moduleRef(selectedModule.id), { letter: turn.letter, number: turn.number }, { merge: true });
        return turn;
      });

      // Siempre se registra, aunque la voz esté apagada, para que el visor lo muestre.
      await announceCall(next.letter, next.number);
      startCooldown();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al avanzar el turno.');
    }
  };

  const openPip = async () => {
    if (!('documentPictureInPicture' in window)) {
      alert('Tu navegador no soporta el Modo Compacto. Usa Chrome o Edge en su versión más reciente.');
      return;
    }
    try {
      const pip = await window.documentPictureInPicture.requestWindow({ width: 320, height: 480 });

      // Copiar los estilos de la página a la ventana flotante
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const style = document.createElement('style');
          style.textContent = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          pip.document.head.appendChild(style);
        } catch {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = styleSheet.href;
          pip.document.head.appendChild(link);
        }
      });

      pip.document.title = 'Turnos · Modo compacto';
      Object.assign(pip.document.body.style, { background: '#ffffff', margin: '0', padding: '0' });

      const pipRoot = document.createElement('div');
      pipRoot.id = 'pip-root';
      pip.document.body.appendChild(pipRoot);

      setPipWindow(pip);
      pip.addEventListener('pagehide', () => setPipWindow(null));
    } catch (error) {
      console.error(error);
      alert('No se pudo abrir el modo compacto.');
    }
  };

  const handleLogoutAction = async () => {
    if (pipWindow) pipWindow.close();
    if (selectedModule) {
      await freeModule(selectedModule.id).catch(console.error);
    }
    onLogout();
  };

  const handleSelectModule = async (mod) => {
    try {
      await occupyModule(mod.id, operatorKey || auth.currentUser.uid, operator.name);
      setSelectedModule(mod);
    } catch (e) {
      console.error(e);
      alert('Error al seleccionar módulo.');
    }
  };

  if (loading) return <LoadingScreen label="Cargando tu perfil…" />;

  // ---------- Sin perfil ----------
  if (!operator) {
    return (
      <AreaContext.Provider value="operator">
        <div className="ui-root min-h-screen bg-slate-50">
          <AppHeader onLogout={onLogout} />
          <main className="mx-auto max-w-md px-6 py-20">
            <Card className="ui-fade-up p-8 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                <UserX size={22} />
              </span>
              <h1 className="mt-5 text-lg font-semibold text-slate-900">No encontramos tu perfil</h1>
              <p className="mt-2 text-sm text-slate-500">Tu cuenta no tiene un perfil de operador asociado. Contacta a Jefatura del SOME.</p>
              <Button variant="secondary" className="mx-auto mt-6" onClick={onLogout}>
                <LogOut size={16} />
                Cerrar sesión
              </Button>
            </Card>
          </main>
        </div>
      </AreaContext.Provider>
    );
  }

  const firstName = (operator.name || '').split(' ')[0];

  // ---------- Selección de módulo ----------
  if (!selectedModule) {
    const myModule = FIXED_MODULES.find((m) => modulesStatus[m.id]?.activeOperatorId === operatorKey);
    return (
      <AreaContext.Provider value="operator">
        <div className="ui-root min-h-screen bg-slate-50">
          <AppHeader user={{ name: operator.name, detail: 'Sin módulo asignado' }} onLogout={handleLogoutAction} />
          <main className="ui-fade-up mx-auto max-w-5xl px-6 py-14">
            <div className="text-center">
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${OPERATOR.eyebrow}`}>Inicio de jornada</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">¿En qué módulo atenderás hoy?</h1>
              <p className="mt-2 text-[15px] text-slate-500">Hola, {firstName}. Elige tu módulo para comenzar a llamar turnos.</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {FIXED_MODULES.map((mod) => (
                <ModuleOption
                  key={mod.id}
                  mod={mod}
                  status={modulesStatus[mod.id]}
                  isMine={modulesStatus[mod.id]?.activeOperatorId === operatorKey}
                  blocked={!!myModule && myModule.id !== mod.id}
                  onSelect={handleSelectModule}
                />
              ))}
            </div>
            <p className="mt-10 text-center text-[13px] text-slate-400">
              Los módulos ocupados se liberan cuando su operador cierra sesión o desde Administración.
            </p>
          </main>
        </div>
      </AreaContext.Provider>
    );
  }

  // ---------- Panel de atención ----------
  const audioOn = !!globalQueue.audioEnabled;
  const language = globalQueue.audioLanguage || 'es';
  const controlsProps = {
    module: selectedModule,
    operatorName: operator.name,
    turnLabel: formatTurn(moduleState.letter, moduleState.number),
    globalLabel: formatTurn(globalQueue.globalTurnLetter, globalQueue.globalTurnNumber),
    audioOn,
    coolingDown: isCoolingDown,
    onNext: advanceTurn,
    onRepeat: repeatAudio,
    onPip: 'documentPictureInPicture' in window ? openPip : null,
  };

  return (
    <AreaContext.Provider value="operator">
      <div className="ui-root min-h-screen bg-slate-50">
        <AppHeader user={{ name: operator.name, detail: selectedModule.name }} onLogout={handleLogoutAction} />
        <main className="ui-fade-up mx-auto max-w-[1440px] px-6 py-8 lg:px-8">
          <div className="mb-6">
            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${OPERATOR.eyebrow}`}>Panel de atención</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Hola, {firstName}</h1>
            <p className="mt-1 text-sm text-slate-500">Estás atendiendo en el {selectedModule.name}. Llama a cada paciente en orden.</p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {pipWindow ? (
                <Card className="px-8 py-16 text-center">
                  <span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${OPERATOR.iconSoft}`}>
                    <PictureInPicture2 size={26} />
                  </span>
                  <h2 className="mt-5 text-lg font-semibold text-slate-900">Modo compacto activo</h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                    Los controles de llamado están en la ventana flotante. Puedes seguir trabajando en otras aplicaciones.
                  </p>
                  <Button variant="soft" size="lg" className="mx-auto mt-6" onClick={() => pipWindow.close()}>
                    Volver a mostrar aquí
                  </Button>
                  {createPortal(<TurnControls compact {...controlsProps} />, pipWindow.document.getElementById('pip-root'))}
                </Card>
              ) : (
                <TurnControls {...controlsProps} />
              )}
            </div>

            <aside className="space-y-4 lg:col-span-5">
              <div className="flex flex-wrap items-baseline gap-x-2 px-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Opciones globales</p>
                <p className="text-xs text-slate-400">Afectan a todos los módulos</p>
              </div>
              <ManualTurnCard currentLetter={globalQueue.globalTurnLetter} currentNumber={globalQueue.globalTurnNumber} />
              <Card>
                <CardHeader
                  icon={audioOn ? Volume2 : VolumeX}
                  title="Anuncio por voz"
                  description="Lee cada llamado en la pantalla de la sala."
                  action={<Toggle checked={audioOn} onChange={() => updateConfig({ audioEnabled: !audioOn })} label="Activar o desactivar la voz" />}
                />
                <div className="px-6 pb-6 pt-5">
                  <Label>Idioma de la voz</Label>
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                    {LANGUAGES.map(([code, label]) => (
                      <button
                        key={code}
                        type="button"
                        aria-pressed={language === code}
                        onClick={() => updateConfig({ audioLanguage: code })}
                        className={`h-9 rounded-lg text-sm font-semibold transition ${language === code ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </AreaContext.Provider>
  );
}

// Tarjeta de un módulo en la pantalla de selección
function ModuleOption({ mod, status, isMine, blocked, onSelect }) {
  const busyByOther = !!status?.activeOperatorId && !isMine;
  const disabled = busyByOther || blocked;
  let badge = <Badge tone="success" dot>Disponible</Badge>;
  if (isMine) badge = <Badge tone="info" dot>Tu módulo actual</Badge>;
  else if (busyByOther) badge = <Badge tone="neutral">Ocupado</Badge>;
  else if (blocked) badge = <Badge tone="neutral">No disponible</Badge>;

  return (
    <button
      type="button"
      aria-label={mod.name}
      disabled={disabled}
      onClick={() => onSelect(mod)}
      className={`group flex flex-col items-center rounded-2xl border bg-white px-4 py-7 text-center shadow-card transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 ${
        disabled ? 'border-slate-200/80 opacity-60' : 'border-slate-200/80 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-600/10'
      } ${isMine ? 'border-indigo-300 ring-4 ring-indigo-500/10' : ''}`}
    >
      <span className={`grid h-16 w-16 place-items-center rounded-2xl font-display text-3xl font-bold transition ${disabled ? 'bg-slate-100 text-slate-400' : OPERATOR.tile}`}>
        {mod.letter}
      </span>
      <span className="mt-4 text-[15px] font-semibold text-slate-900">{mod.name}</span>
      <span className="mt-2">{badge}</span>
      <span className="mt-2 h-4 max-w-full truncate text-xs text-slate-500">{busyByOther ? status.activeOperatorName : ''}</span>
    </button>
  );
}

// Controles de llamado. compact = ventana flotante (320×480).
function TurnControls({ compact = false, module, operatorName, turnLabel, globalLabel, audioOn, coolingDown, onNext, onRepeat, onPip }) {
  const area = useArea();

  const nextButton = (
    <Button size={compact ? 'lg' : 'xl'} block onClick={onNext} disabled={coolingDown}>
      {coolingDown ? <LoaderCircle size={20} className="animate-spin" /> : null}
      {coolingDown ? (audioOn ? 'Anunciando en sala…' : 'Mostrando en sala…') : 'Siguiente turno'}
      {coolingDown ? null : <ArrowRight size={compact ? 18 : 22} />}
    </Button>
  );
  const repeatButton = (
    <Button variant="secondary" size={compact ? 'md' : 'lg'} block onClick={onRepeat} disabled={!audioOn || coolingDown}>
      <Repeat size={compact ? 16 : 18} />
      Repetir llamado
    </Button>
  );

  if (compact) {
    return (
      <div className="ui-root flex min-h-screen flex-col bg-white">
        <div className={`h-1 ${area.accentLine}`} />
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-center gap-2.5">
            <span className={`grid h-8 w-8 place-items-center rounded-lg font-display text-base font-bold ${area.tile}`}>{module.letter}</span>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-semibold text-slate-900">{module.name}</p>
              <p className="truncate text-xs text-slate-500">{operatorName}</p>
            </div>
          </div>
          <div className={`flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-100 py-6 ${area.wash}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Turno actual</p>
            <p className={`mt-2 font-display text-6xl font-bold leading-none tracking-tight ${area.gradientText}`}>{turnLabel}</p>
            <p className="mt-3 text-xs text-slate-500">
              Fila global <span className="font-display font-semibold text-slate-800">{globalLabel}</span>
            </p>
          </div>
          {nextButton}
          {repeatButton}
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-bold ${area.tile}`}>{module.letter}</span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold text-slate-900">{module.name}</p>
            <p className="text-[13px] text-slate-500">{operatorName}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[13px] font-medium text-slate-600">
          Fila global
          <span className="font-display font-semibold text-slate-900">{globalLabel}</span>
        </span>
      </div>

      <div className={`px-6 py-10 text-center ${area.wash}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Turno actual</p>
        <p className={`mt-3 font-display text-[104px] font-bold leading-none tracking-tight ${area.gradientText}`}>{turnLabel}</p>
        <p className="mt-4 text-[13px] text-slate-500">
          {audioOn ? 'Cada llamado se anuncia por voz en la sala de espera.' : 'La voz está desactivada: el llamado solo se muestra en pantalla.'}
        </p>
      </div>

      <div className="space-y-3 border-t border-slate-100 px-6 py-6">
        {nextButton}
        <div className={`grid gap-3 ${onPip ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {repeatButton}
          {onPip && (
            <Button variant="secondary" size="lg" block onClick={onPip}>
              <PictureInPicture2 size={18} />
              Modo compacto
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
