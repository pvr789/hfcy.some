import { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { LogOut, Trash2 } from 'lucide-react';

const FIXED_MODULES = [
  { id: 'modulo_a', name: 'Módulo A', letter: 'A' },
  { id: 'modulo_b', name: 'Módulo B', letter: 'B' },
  { id: 'modulo_c', name: 'Módulo C', letter: 'C' },
  { id: 'modulo_d', name: 'Módulo D', letter: 'D' },
  { id: 'modulo_e', name: 'Módulo E', letter: 'E' },
];

export default function SuperAdmin({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [modulesStatus, setModulesStatus] = useState({});
  
  const [newUserRut, setNewUserRut] = useState('');
  const [newUserRutConfirm, setNewUserRutConfirm] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [globalTurn, setGlobalTurn] = useState({ letter: 'A', number: 0 });
  const [manualTurn, setManualTurn] = useState({ letter: 'A', number: 0 });

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editModuleId, setEditModuleId] = useState('none');


  const [liveDate, setLiveDate] = useState('');
  const [liveTime, setLiveTime] = useState('');

  
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system', 'status'), (docSnap) => {
      if (docSnap.exists()) {
        setIsSystemOpen(docSnap.data().isOpen !== false);
      } else {
        setIsSystemOpen(true);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      setLiveDate(`${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`);
      setLiveTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatRut = (value) => {
    let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length === 0) return '';
    if (clean.length <= 1) return clean;
    return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const u = [];
      snap.forEach(document => {
        u.push({ id: document.id, ...document.data() });
      });
      setUsers(u);
    });
    
    const unsubs = FIXED_MODULES.map(mod => {
      return onSnapshot(doc(db, `system/modules_${mod.id}`), (snap) => {
        if (snap.exists()) {
          setModulesStatus(prev => ({
            ...prev,
            [mod.id]: snap.data()
          }));
        }
      });
    });

    const unsubConfig = onSnapshot(doc(db, 'system/config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const currentTurn = {
          letter: data.globalTurnLetter || 'A',
          number: data.globalTurnNumber !== undefined ? data.globalTurnNumber : 0
        };
        setGlobalTurn(currentTurn);
      }
    });

    return () => {
      unsub();
      unsubs.forEach(u => u());
      unsubConfig();
    };
  }, []);

  
  const handleToggleSystemStatus = async () => {
    const newState = !isSystemOpen;
    if (!window.confirm(`¿Estás seguro de que deseas ${newState ? 'ABRIR' : 'CERRAR'} el sistema?\n\nSi lo cierras, todos los operadores serán desconectados inmediatamente.`)) return;
    
    try {
      await setDoc(doc(db, 'system', 'status'), { isOpen: newState }, { merge: true });
      if (!newState) {
        for (const m of FIXED_MODULES) {
          if (modulesStatus[m.id]?.status === 'occupied') {
            await updateDoc(doc(db, `system/modules_${m.id}`), {
              activeOperatorId: null,
              activeOperatorName: null,
              status: 'available',
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }
      setSuccess(`Sistema ${newState ? 'abierto' : 'cerrado'}.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(error);
      setError("Error al cambiar estado del sistema.");
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
      setLoading(false); return;
    }

    if (rutClean !== rutConfirmClean) {
      setError('Los RUT ingresados no coinciden.');
      setLoading(false);
      return;
    }

    const existingUser = users.find(u => u.rut === rutClean);
    if (existingUser) {
       // Editar usuario existente
       if (!newUserName.trim()) {
         setError('Ingresa el nombre para actualizarlo.');
         setLoading(false);
         return;
       }
       try {
         await updateDoc(doc(db, 'users', existingUser.id), {
           name: newUserName
         });
         setSuccess(`¡Nombre actualizado para el RUT ${rutClean}!`);
         setNewUserRut('');
         setNewUserRutConfirm('');
         setNewUserName('');
         setNewUserPassword('');
         setNewUserPasswordConfirm('');
       } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
         console.error(e);
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
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      const loginEmail = `${rutClean}@some.cl`;
      let newUid;
      
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, loginEmail, newUserPassword);
        newUid = userCredential.user.uid;
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          try {
            const loginCred = await signInWithEmailAndPassword(secondaryAuth, loginEmail, newUserPassword);
            newUid = loginCred.user.uid;
          } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
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
        createdAt: new Date().toISOString()
      });

      setSuccess(`¡Operador ${newUserName} creado con éxito!`);
      setNewUserRut('');
      setNewUserRutConfirm('');
      setNewUserName('');
      setNewUserPassword('');
      setNewUserPasswordConfirm('');
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
      let errorMsg = 'Ocurrió un error inesperado.';
      if (e.message === 'restoration-failed') errorMsg = 'El RUT ya existe oculto. Para restaurarlo ingresa su contraseña original.';
      else if (e.code === 'auth/email-already-in-use') errorMsg = 'El RUT ya está registrado.';
      else if (e.code === 'auth/weak-password') errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      else if (e.code === 'auth/invalid-email') errorMsg = 'El RUT ingresado no es válido.';
      else errorMsg = e.message || 'Error desconocido';
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFixTurn = async () => {
    try {
      const globalConfigRef = doc(db, 'system/config');
      let newNum = manualTurn.number - 1;
      let newLetter = manualTurn.letter;
      
      if (newNum < 0) {
        newNum = 99;
        let charCode = newLetter.charCodeAt(0) - 1;
        if (charCode < 65) charCode = 90;
        newLetter = String.fromCharCode(charCode);
      }

      await updateDoc(globalConfigRef, {
        globalTurnLetter: newLetter,
        globalTurnNumber: newNum
      });
      setSuccess('¡Turno fijado con éxito!');
      setTimeout(() => setSuccess(null), 3000);
    } catch(e) {
      console.error(e);
      setError('Error fijando turno');
    }
  };

  const handleFreeModule = async (moduleId, moduleName) => {
    if (!window.confirm(`¿Liberar el ${moduleName}? Desconectará al operador actual.`)) return;
    try {
      await updateDoc(doc(db, `system/modules_${moduleId}`), {
        activeOperatorId: null,
        activeOperatorName: null,
        status: 'available',
        lastUpdated: new Date().toISOString()
      });
      setSuccess(`${moduleName} liberado.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch(e) {
      console.error(e);
      setError('Error al liberar módulo');
    }
  };

  const handleDeleteUser = async (uid, name) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al operador "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      setSuccess(`Operador ${name} eliminado.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
      setError('Error al eliminar usuario.');
    }
  };

  
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditIsActive(user.isActive !== false);
    const occupiedModule = FIXED_MODULES.find(m => modulesStatus[m.id]?.activeOperatorId === user.rut || modulesStatus[m.id]?.activeOperatorId === user.id);
    setEditModuleId(occupiedModule ? occupiedModule.id : 'none');
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        name: editName,
        isActive: editIsActive
      });

      let finalModuleId = editIsActive ? editModuleId : 'none';

      const prevModule = FIXED_MODULES.find(m => modulesStatus[m.id]?.activeOperatorId === editingUser.rut || modulesStatus[m.id]?.activeOperatorId === editingUser.id);
      
      if (prevModule && prevModule.id !== finalModuleId) {
        await updateDoc(doc(db, `system/modules_${prevModule.id}`), {
          activeOperatorId: null,
          activeOperatorName: null,
          status: 'available',
          lastUpdated: new Date().toISOString()
        });
      }

      if (finalModuleId !== 'none' && (!prevModule || prevModule.id !== finalModuleId)) {
        await updateDoc(doc(db, `system/modules_${finalModuleId}`), {
          activeOperatorId: editingUser.rut,
          activeOperatorName: editName,
          status: 'occupied',
          lastUpdated: new Date().toISOString()
        });
      }

      setSuccess(`Usuario ${editName} actualizado.`);
      setEditingUser(null);
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
      setError('Error al actualizar operador.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (uid, currentState, rut) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive: !currentState
      });
      
      if (currentState === true) {
        for (const mod of FIXED_MODULES) {
          const status = modulesStatus[mod.id];
          if (status && (status.activeOperatorId === uid || status.activeOperatorId === rut)) {
            await updateDoc(doc(db, `system/modules_${mod.id}`), {
              activeOperatorId: null,
              activeOperatorName: null,
              status: 'available',
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
      setError('Error al cambiar estado del usuario.');
    }
  };

  return (
    <div className="bg-[#f0f4f8] font-sans text-slate-800 min-h-screen flex flex-col justify-between antialiased selection:bg-blue-100 selection:text-blue-700">
      
      <header className="bg-white border-b border-slate-200/80 px-8 py-3.5 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-6 flex-wrap xl:flex-nowrap">
          <div className="flex items-center gap-3.5">
            <img alt="Logo Hospital de Yumbel" className="w-11 h-11 rounded-full object-cover shadow-sm border border-slate-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnlb_Qek0e-k-UYeE3t5ZspyVUV1JKd7q2PrDfISINdEgDiEAQxBazBDTZ6DbFQJtfEbM1BKTFNAmCOGk6DHHa-xyqFVD_B8wfVLt6NkAjYw9fXfSTtvzp9XAeEecdGvKAsEaO5DBhWugyKPaZOSulylIuVy3v20xOgzxz-oGJe9LcDcX4OCWe4RQfGosf53mUP9xGTVx3bpqn-Svo5N4IxP4oRihjGMmBmAaQIwvYq-yoEh5PjPHju8XJW45ZSdSTJREWFSNN9KjjzPk" />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Hospital de Yumbel</h1>
              <p className="text-[11px] tracking-wider font-semibold text-slate-400 uppercase">Sistema de Atención y Espera</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={onLogout} className="text-xs font-bold text-slate-500 hover:text-red-500 transition px-2 py-1">
              Cerrar Sesión
            </button>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-1.5 shadow-xs">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-700 tracking-tight leading-tight">{liveDate}</span>
              </div>
              <div className="h-7 w-px bg-slate-200"></div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-800 tracking-tight font-mono tabular-nums leading-none">{liveTime}</span>
                <span className="text-[11px] font-bold text-teal-700 tracking-wider">HRS</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-1.5 shadow-xs">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none" title="Abrir o Cerrar Sistema Global">
                <span className={`text-xs font-bold ${isSystemOpen ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isSystemOpen ? 'Sistema Abierto' : 'Sistema Cerrado'}
                </span>
                <div className="relative inline-flex items-center">
                  <input 
                    checked={isSystemOpen} 
                    onChange={handleToggleSystemStatus} 
                    className="sr-only peer" 
                    type="checkbox" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1720px] mx-auto w-full px-8 py-7 flex-1">
        
        {(error || success) && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold shadow-sm ${error ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
            {error || success}
          </div>
        )}

        <div className="flex flex-col gap-8">
          
          {/* LEFT COLUMN: SISTEMA */}
          <section className="w-full flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <h2 className="text-lg font-extrabold text-slate-800">Sistema</h2>
              <span className="text-slate-400 text-xs font-medium">• Ajuste de turnos y estado de módulos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card: Ajuste Manual */}
              <article className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <h3 className="font-bold text-slate-900 text-base">Ajuste Manual</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">Modifica el turno de la fila si ocurrió un salto.</p>

                  <div className="bg-[#f1f6fe] rounded-2xl p-4 flex items-center justify-between mb-6 border border-blue-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 tracking-wider">
                      <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                      EN SALA
                    </div>
                    <div className="text-2xl font-black text-blue-600 tracking-wider">
                      {globalTurn.letter}-{globalTurn.number.toString().padStart(2, '0')}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Próximo Turno:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center bg-white shadow-xs focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight flex items-center gap-1 z-10 pointer-events-none">
                          <span className="text-[10px]">T</span> LETRA
                        </span>
                        <select 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          value={manualTurn.letter}
                          onChange={(e) => setManualTurn({ ...manualTurn, letter: e.target.value })}
                        >
                          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                            <option key={letter} value={letter}>{letter}</option>
                          ))}
                        </select>
                        <span className="text-2xl font-black text-blue-600 mt-1 pointer-events-none">{manualTurn.letter}</span>
                      </div>
                      
                      <div className="relative border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center bg-white shadow-xs focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight flex items-center gap-1 z-10 pointer-events-none">
                          <span className="text-[10px]">#</span> NÚMERO
                        </span>
                        <input 
                          type="number"
                          min="0" max="99"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                          value={manualTurn.number}
                          onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9]/g, '');
                              if (val.length > 2) val = val.slice(0, 2);
                              setManualTurn({ ...manualTurn, number: val });
                            }} 
                        />
                        <span className="text-2xl font-black text-blue-600 mt-1 pointer-events-none">{manualTurn.number}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleFixTurn}
                  className="w-full bg-[#f1f5f9] hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 px-4 rounded-xl transition duration-150 active:scale-[0.99] text-center"
                >
                  Fijar Turno
                </button>
              </article>

              {/* Card: Monitor */}
              <article className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <h3 className="font-bold text-slate-900 text-base">Monitor</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">Estado de los módulos de atención.</p>

                <div className="space-y-2 flex-1 flex flex-col justify-between custom-scrollbar" style={{maxHeight: '280px', overflowY: 'auto'}}>
                  {FIXED_MODULES.map(mod => {
                    const status = modulesStatus[mod.id];
                    const isOccupied = status && status.activeOperatorId;
                    
                    if (isOccupied) {
                      return (
                        <div key={mod.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f0fdf4] border border-emerald-300 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block"></span>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">{mod.name}</span>
                              <span className="text-[11px] font-semibold text-emerald-600">{status.activeOperatorName}</span>
                            </div>
                          </div>
                          <button onClick={() => handleFreeModule(mod.id, mod.name)} className="text-slate-400 hover:text-red-500 transition p-1" title="Desconectar Módulo">
                            <LogOut size={16} />
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <div key={mod.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200/60 text-xs">
                          <div className="flex items-center gap-2.5 font-bold text-slate-800">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            {mod.name}
                          </div>
                          <span className="text-slate-400 font-medium text-xs">Disponible</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </article>
            </div>
          </section>

          {/* RIGHT COLUMN: OPERADORES */}
          <section className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <h2 className="text-lg font-extrabold text-slate-800">Operadores</h2>
                <span className="text-slate-400 text-xs font-medium">• Personal y credenciales de acceso</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card: Nuevo Operador */}
              <article className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70 flex flex-col justify-between">
                <form className="flex flex-col h-full justify-between" onSubmit={handleCreateUser}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      <h3 className="font-bold text-slate-900 text-base">Nuevo Operador</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-5">Registrar usuario o editar nombre existente.</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre</label>
                        <input required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="Ej. Daniela Pérez" type="text" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Rut</label>
                          <input required value={newUserRut} onChange={e => setNewUserRut(formatRut(e.target.value))} maxLength={10} className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="12345678-9" type="text" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Repetir</label>
                          <input required value={newUserRutConfirm} onChange={e => setNewUserRutConfirm(formatRut(e.target.value))} maxLength={10} className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="12345678-9" type="text" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña</label>
                          <input value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="Mín. 6 (Ignorado al editar)" type="password" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Repetir</label>
                          <input value={newUserPasswordConfirm} onChange={e => setNewUserPasswordConfirm(e.target.value)} className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" placeholder="Repetir" type="password" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button disabled={loading} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3.5 px-4 rounded-xl shadow-md shadow-blue-600/30 transition duration-150 active:scale-[0.99] text-center disabled:opacity-70" type="submit">
                    {loading ? 'Procesando...' : 'Guardar Operador'}
                  </button>
                </form>
              </article>

              {/* Card: Gestión */}
              <article className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <h3 className="font-bold text-slate-900 text-base">Gestión</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">Control de acceso y estado.</p>

                <div className="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 pr-1" style={{maxHeight: '285px'}}>
                  {users.map(user => {
                    const isOccupying = FIXED_MODULES.some(m => modulesStatus[m.id]?.activeOperatorId === user.rut || modulesStatus[m.id]?.activeOperatorId === user.id);
                    const occupiedModule = FIXED_MODULES.find(m => modulesStatus[m.id]?.activeOperatorId === user.rut || modulesStatus[m.id]?.activeOperatorId === user.id);
                    
                    const isActive = user.isActive !== false;

                    return (
                      <div key={user.id} className={`p-3 bg-[#f8fafc] rounded-2xl border border-slate-200/70 flex items-center justify-between ${!isActive ? 'opacity-70' : ''}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{user.name}</span>
                            {isOccupying ? (
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">En Turno</span>
                            ) : !isActive ? (
                              <span className="bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">Inhabilitado</span>
                            ) : (
                              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">Activo</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                            RUT: {user.rut} {isOccupying && occupiedModule ? ` • ${occupiedModule.name}` : ''}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 text-slate-400">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <span className="text-[11px] font-medium text-slate-500">Habilitar</span>
                            <div className="relative inline-flex items-center">
                              <input 
                                checked={isActive} 
                                onChange={() => handleToggleActive(user.id, isActive, user.rut)} 
                                className="sr-only peer" 
                                type="checkbox" 
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </div>
                          </label>
                          <button onClick={() => openEditModal(user)} className="p-1.5 hover:text-blue-600 transition text-slate-400" title="Editar Operador">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          <button onClick={() => handleDeleteUser(user.id, user.name)} className="p-1.5 hover:text-red-500 transition" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {users.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No hay operadores registrados.</p>
                  )}
                </div>
              </article>
            </div>
          </section>

        </div>
      </main>

      <footer className="py-5 text-center text-xs text-slate-400 border-t border-slate-200/50 bg-transparent">
        <p>Hospital de la Familia y Comunidad de Yumbel © 2026. Todos los derechos reservados. Módulo de Administración de Turnos v1.0</p>
      
      {/* Modal Editar Operador */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Editar Operador</h3>
                  <p className="text-xs text-slate-500">Actualizar información y acceso.</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition" onClick={closeEditModal}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSaveEdit}>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre del Funcionario</label>
                <input required className="w-full text-xs font-semibold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">RUT Institucional (No editable)</label>
                  <input disabled className="w-full text-xs font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 cursor-not-allowed" type="text" value={editingUser.rut} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estado de Acceso</label>
                  <select value={editIsActive ? "activo" : "inhabilitado"} onChange={e => setEditIsActive(e.target.value === 'activo')} className="w-full text-xs font-semibold text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition">
                    <option value="activo">Activo (Habilitado)</option>
                    <option value="inhabilitado">Inhabilitado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Módulo Asignado</label>
                <select value={editModuleId} onChange={e => setEditModuleId(e.target.value)} className="w-full text-xs font-medium text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition">
                  <option value="none">Sin asignar (Flotante)</option>
                  <option value="modulo_a">Módulo A</option>
                  <option value="modulo_b">Módulo B</option>
                  <option value="modulo_c">Módulo C</option>
                  <option value="modulo_d">Módulo D</option>
                  <option value="modulo_e">Módulo E</option>
                </select>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition" onClick={closeEditModal} type="button">Cancelar</button>
                <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-blue-600/30 transition duration-150 active:scale-[0.99] flex items-center gap-1.5 disabled:opacity-70" type="submit">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </footer>
    </div>
  );
}
