import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { runTransaction, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { LogOut, ArrowRight, Settings2, Hash, Type, Volume2, VolumeX, Globe, Repeat, Copy, LayoutGrid, Pause, Play, PictureInPicture } from 'lucide-react';

const FIXED_MODULES = [
  { id: 'modulo_a', name: 'Módulo A', letter: 'A' },
  { id: 'modulo_b', name: 'Módulo B', letter: 'B' },
  { id: 'modulo_c', name: 'Módulo C', letter: 'C' },
  { id: 'modulo_d', name: 'Módulo D', letter: 'D' },
  { id: 'modulo_e', name: 'Módulo E', letter: 'E' },
];

export default function ClientAdmin({ onLogout }) {
  const [operator, setOperator] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  
  const [globalQueue, setGlobalQueue] = useState({ audioEnabled: true, audioLanguage: 'es' });
  const [moduleState, setModuleState] = useState({ letter: 'A', number: 0, isPaused: false });
  const [manualTurn, setManualTurn] = useState({ letter: 'A', number: '' });
  
  const [loading, setLoading] = useState(true);

  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [pipWindow, setPipWindow] = useState(null);
  
  const [modulesStatus, setModulesStatus] = useState({});

  const [liveTime, setLiveTime] = useState('');
  const [liveDate, setLiveDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }));
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      setLiveDate(`${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`);
    };
    updateTime();
    const intId = setInterval(updateTime, 1000);
    return () => clearInterval(intId);
  }, []);

  useEffect(() => {
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
    return () => unsubs.forEach(unsub => unsub());
  }, []);

  const openPip = async () => {
    if (!('documentPictureInPicture' in window)) {
      alert('Tu navegador no soporta el Modo Flotante. Usa Chrome o Edge en su versión más reciente.');
      return;
    }

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 480,
      });

      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          pip.document.head.appendChild(link);
        }
      });

      const bodyClass = document.body.className;
      pip.document.body.className = bodyClass;
      pip.document.body.style.background = '#f8fafc';
      pip.document.body.style.margin = '0';
      pip.document.body.style.padding = '0';

      const pipRoot = document.createElement('div');
      pipRoot.id = 'pip-root';
      pip.document.body.appendChild(pipRoot);

      setPipWindow(pip);

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
      });
    } catch (error) {
      console.error(error);
      alert('No se pudo abrir el modo flotante.');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        onLogout();
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setOperator({ id: uid, ...userDoc.data() });
        }
      } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [onLogout]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system/config'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalQueue(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    const unsub = onSnapshot(doc(db, `system/modules_${selectedModule.id}`), (docSnap) => {
      if (docSnap.exists()) {
        setModuleState(docSnap.data());
      }
    });
    return () => unsub();
  }, [selectedModule]);

  const handleSetTurn = async () => {
    const num = parseInt(manualTurn.number, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      alert("Por favor ingresa un número de turno válido entre 1 y 99.");
      return;
    }

    if (!window.confirm(`¿Estás seguro que deseas fijar el próximo turno global en ${manualTurn.letter}-${num}? Todos los módulos saltarán a este número.`)) {
      return;
    }

    try {
      const turnRef = doc(db, `system/config`);
      await updateDoc(turnRef, {
        globalTurnLetter: manualTurn.letter,
        globalTurnNumber: num - 1
      });
      setManualTurn({ letter: manualTurn.letter, number: '' });
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
    }
  };

  const toggleAudio = async () => {
    try {
      const turnRef = doc(db, `system/config`);
      await updateDoc(turnRef, {
        audioEnabled: !globalQueue.audioEnabled
      });
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
    }
  };

  const setLanguage = async (lang) => {
    try {
      const turnRef = doc(db, `system/config`);
      await updateDoc(turnRef, {
        audioLanguage: lang
      });
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
    }
  };

  const repeatAudio = async () => {
    if (!selectedModule || !globalQueue.audioEnabled || isCoolingDown) return;
    try {
      await addDoc(collection(db, `system/calls/history`), {
        letter: moduleState.letter,
        number: moduleState.number,
        moduleName: selectedModule.name,
        moduleId: selectedModule.id,
        timestamp: Date.now(),
      });
      setIsCoolingDown(true);
      setTimeout(() => setIsCoolingDown(false), 3000);
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
    }
  };

  const advanceTurn = async () => {
    if (!selectedModule || isCoolingDown) return;

    try {
      const globalTurnRef = doc(db, 'system/config');
      const moduleRef = doc(db, `system/modules_${selectedModule.id}`);

      let newLetter;
      let newNumber;

      await runTransaction(db, async (transaction) => {
        const globalSnap = await transaction.get(globalTurnRef);
        const moduleSnap = await transaction.get(moduleRef);

        if (!globalSnap.exists() || !moduleSnap.exists()) {
          throw new Error("Datos no encontrados");
        }

        const globalData = globalSnap.data();
        let currentNumber = globalData.globalTurnNumber !== undefined ? globalData.globalTurnNumber : 0;
        let currentLetter = globalData.globalTurnLetter || 'A';

        newNumber = currentNumber + 1;
        newLetter = currentLetter;

        if (newNumber > 99) {
          newNumber = 1;
          const letters = ['A','B','C','D','E'];
          const idx = letters.indexOf(currentLetter);
          newLetter = letters[(idx + 1) % letters.length];
        }

        transaction.update(globalTurnRef, {
          globalTurnNumber: newNumber,
          globalTurnLetter: newLetter
        });

        transaction.update(moduleRef, {
          letter: newLetter,
          number: newNumber
        });
      });

      await addDoc(collection(db, `system/calls/history`), {
          letter: newLetter,
          number: newNumber,
          moduleName: selectedModule.name,
          moduleId: selectedModule.id,
          timestamp: Date.now(),
        });

        setIsCoolingDown(true);
        setTimeout(() => setIsCoolingDown(false), 3000);
      
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
      alert('Hubo un error al avanzar el turno.');
    }
  };

  const handleLogoutAction = async () => {
    if (pipWindow) pipWindow.close();
    
    if (selectedModule) {
      try {
        const modRef = doc(db, `system/modules_${selectedModule.id}`);
        await setDoc(modRef, {
          activeOperatorId: null,
          activeOperatorName: null
        }, { merge: true });
      } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
        console.error(e);
      }
    }
    onLogout();
  };

  const handleSelectModule = async (mod) => {
    try {
      const modRef = doc(db, `system/modules_${mod.id}`);
      await setDoc(modRef, {
        activeOperatorId: operator.rut || operator.id || auth.currentUser.uid,
        activeOperatorName: operator.name
      }, { merge: true });
      setSelectedModule(mod);
    } catch (err) {
          // eslint-disable-next-line no-unused-vars
          const e = err;
      console.error(e);
      alert("Error al seleccionar módulo.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Cargando perfil...
        </div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
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
          </div>
        </div>
      </header>
        <div className="p-10 text-center text-slate-500 font-bold">No se encontró tu perfil de usuario. Contacta al administrador.</div>
      </div>
    );
  }

  if (!selectedModule) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
            <button onClick={handleLogoutAction} className="text-xs font-bold text-slate-500 hover:text-red-500 transition px-2 py-1">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

        <main className="admin-dashboard fade-in" style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px'}}>
          <div className="admin-card glass" style={{maxWidth: 800, width: '100%', textAlign: 'center', padding: '40px 20px'}}>
            <LayoutGrid size={48} style={{opacity: 0.2, margin: '0 auto 20px auto'}} />
            <h2 style={{marginBottom: 30, color: '#334155', fontSize: '1.5rem', fontWeight: 900}}>¿En qué módulo atenderás hoy?</h2>
            
            <div style={{display: 'flex', gap: 15, flexWrap: 'wrap', justifyContent: 'center'}}>
              {FIXED_MODULES.map(mod => {
                const status = modulesStatus[mod.id];
                const operatorRut = operator.rut || operator.id || auth.currentUser.uid;
                const myOccupiedModule = FIXED_MODULES.find(m => modulesStatus[m.id]?.activeOperatorId === operatorRut);
                
                const isOccupiedByMe = status && status.activeOperatorId === operatorRut;
                const isOccupiedByOther = status && status.activeOperatorId && !isOccupiedByMe;
                
                let isDisabled = false;
                let statusText = 'Disponible';
                let isGhost = false;

                if (myOccupiedModule) {
                  if (isOccupiedByMe) {
                    isDisabled = false;
                    statusText = 'Tu Módulo Actual';
                    isGhost = false;
                  } else {
                    isDisabled = true;
                    statusText = isOccupiedByOther ? `Ocupado por ${status.activeOperatorName}` : 'Debes salir de tu módulo actual';
                    isGhost = true;
                  }
                } else {
                  if (isOccupiedByOther) {
                    isDisabled = true;
                    statusText = `Ocupado por ${status.activeOperatorName}`;
                    isGhost = true;
                  }
                }

                return (
                  <button 
                    key={mod.id} 
                    onClick={() => !isDisabled && handleSelectModule(mod)}
                    className={`btn ${isGhost ? 'ghost' : 'primary push-btn active-press'}`}
                    style={{
                      padding: '20px 40px', 
                      fontSize: '1.2rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      opacity: isDisabled ? 0.6 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      border: isOccupiedByMe ? '2px solid var(--accent-color)' : 'none',
                      minWidth: '180px'
                    }}
                    disabled={isDisabled}
                  >
                    <span style={{fontSize: '2rem', fontWeight: 'bold'}}>{mod.letter}</span>
                    <span style={{fontSize: '0.9rem', opacity: 0.9, marginTop: '4px'}}>{mod.name}</span>
                    <span style={{
                      fontSize: '0.75rem', 
                      marginTop: 10, 
                      background: isOccupiedByMe ? '#d1fae5' : 'rgba(0,0,0,0.05)', 
                      color: isOccupiedByMe ? '#047857' : 'inherit',
                      padding: '4px 10px', 
                      borderRadius: 12,
                      fontWeight: 'bold'
                    }}>{statusText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const controlsContent = (
    <div className={`bg-white ${pipWindow ? 'min-h-screen p-6' : 'rounded-3xl p-6 shadow-xs border border-slate-200/70'} flex flex-col`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-bold tracking-wider">
            {selectedModule.name.toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-slate-600">{operator.name}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Turno Actual en Módulo</span>
        <div className="flex items-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          <span>{moduleState.letter}</span>
          <span className="mx-2 text-slate-300">-</span>
          <span>{Math.max(0, moduleState.number).toString().padStart(2, '0')}</span>
        </div>
        <div className="mt-4 bg-white px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600">
          Fila Global: <span className="text-slate-900">{globalQueue.globalTurnLetter || 'A'}-{(globalQueue.globalTurnNumber !== undefined ? globalQueue.globalTurnNumber : 0).toString().padStart(2, '0')}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-lg py-4 px-6 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-3"
          onClick={advanceTurn} 
          disabled={(isCoolingDown && globalQueue.audioEnabled)}
        >
          SIGUIENTE TURNO <ArrowRight size={24} />
        </button>

        <button 
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={repeatAudio}
          disabled={!globalQueue.audioEnabled || isCoolingDown}
        >
          <Repeat size={20} />
          {isCoolingDown ? 'Reproduciendo...' : 'Repetir Llamado'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
            <button onClick={handleLogoutAction} className="text-xs font-bold text-slate-500 hover:text-red-500 transition px-2 py-1">
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
              <span className="text-xs font-bold text-slate-700">{operator.name}</span>
              <div className="h-7 w-px bg-slate-200"></div>
              <span className="text-xs font-black text-blue-600">{selectedModule.name.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1720px] mx-auto w-full px-8 py-7 flex-1">
        {pipWindow ? (
          <div className="bg-white rounded-3xl p-10 shadow-xs border border-slate-200/70 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-10">
            <PictureInPicture size={48} className="text-purple-500 mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-4">Modo Compacto Activo</h3>
            <p className="text-slate-500 mb-8 font-medium">Los controles de turno están actualmente en la ventana flotante pequeña.</p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-sm" onClick={() => pipWindow.close()}>
              Regresar Controles Aquí
            </button>
            {createPortal(controlsContent, pipWindow.document.getElementById('pip-root'))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            
            {/* LEFT COLUMN: MAIN CONTROLS */}
            <section className="w-full flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 className="text-lg font-extrabold text-slate-800">Panel de Control</h2>
                <span className="text-slate-400 text-xs font-medium">• Controles principales del turno</span>
              </div>
              
              {controlsContent}
              
              {('documentPictureInPicture' in window) && (
                <button 
                  className="mt-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-black py-5 px-6 rounded-3xl transition shadow-md flex items-center justify-center gap-3 w-full border border-slate-700 text-lg uppercase tracking-wide" 
                  onClick={openPip}
                >
                  <PictureInPicture size={24} className="text-purple-400" /> ABRIR MODO COMPACTO
                </button>
              )}
            </section>

            {/* RIGHT COLUMN: GLOBAL SETTINGS */}
            <section className="w-full flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <h2 className="text-lg font-extrabold text-slate-800">Opciones Globales</h2>
                <span className="text-slate-400 text-xs font-medium">• Configuración para todos los módulos</span>
              </div>
              
              <div className="flex flex-col gap-5">
                {/* Ajuste Manual */}
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
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wider">
                      {(globalQueue.globalTurnLetter || 'A')}-{(globalQueue.globalTurnNumber !== undefined ? globalQueue.globalTurnNumber : 0).toString().padStart(2, '0')}
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
                  onClick={handleSetTurn}
                  className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition duration-150 active:scale-[0.99] text-center shadow-sm"
                >
                  Fijar Turno
                </button>
              </article>

                {/* Configuraciones Adicionales (Audio/Idioma) */}
                <article className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {globalQueue.audioEnabled ? <Volume2 className="text-slate-700 w-4 h-4"/> : <VolumeX className="text-slate-700 w-4 h-4"/>}
                      <h3 className="font-bold text-slate-900 text-base">Audio del Sistema</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={globalQueue.audioEnabled} onChange={toggleAudio}/>
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="h-px bg-slate-100 my-4"></div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="text-slate-700 w-4 h-4" />
                      <h3 className="font-bold text-slate-900 text-base">Idioma de Voz</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition ${globalQueue.audioLanguage === 'en' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <input type="radio" name="language" checked={globalQueue.audioLanguage === 'en'} onChange={() => setLanguage('en')} className="hidden"/>
                      <span className="font-bold text-sm">Inglés</span>
                    </label>
                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition ${(!globalQueue.audioLanguage || globalQueue.audioLanguage === 'es') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <input type="radio" name="language" checked={!globalQueue.audioLanguage || globalQueue.audioLanguage === 'es'} onChange={() => setLanguage('es')} className="hidden"/>
                      <span className="font-bold text-sm">Español</span>
                    </label>
                  </div>
                </article>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
