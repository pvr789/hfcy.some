import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Clock } from 'lucide-react';

export default function UserView() {
  const [globalConfig, setGlobalConfig] = useState({ audioEnabled: true, audioLanguage: 'es' });
  
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const isPlayingRef = useRef(false);
  // 1. Cargar Configuración Global
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system/config'), (snap) => {
      if (snap.exists()) {
        setGlobalConfig(snap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Escuchar nuevos llamados en Historial (para la cola)
  const isFirstRun = useRef(true);
  
  useEffect(() => {
    const q = query(collection(db, "system/calls/history"), orderBy("timestamp", "desc"), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      if (isFirstRun.current) {
        // Carga inicial: poblar historial directamente sin reproducir sonido
        const initialDocs = [];
        snap.forEach(doc => initialDocs.push(doc.data()));
        setHistory(initialDocs.slice(0, 5));
        isFirstRun.current = false;
        return;
      }
      
      // Llamados nuevos que entran después de la carga:
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          setQueue(prev => [...prev, data]);
        }
      });
    });
    return () => unsub();
  }, []);

  // 3. Procesar la Cola de Reproducción
  useEffect(() => {
    if (queue.length > 0 && !isPlayingRef.current && started) {
      playNext(queue[0]);
    }
  }, [queue, started]);

  const playAudioSequence = (data) => {
    return new Promise((resolve) => {
      try {
        const lang = globalConfig.audioLanguage || 'es';
        
        const audioTurno = new Audio(`/audio/${lang}/turno.mp3`);
        const audioLetter = new Audio(`/audio/${lang}/${data.letter}.mp3`);
        const audioNumber = new Audio(`/audio/${lang}/${data.number}.mp3`);
        
        // Nuevos audios solicitados
        const audioDirijase = new Audio(`/audio/${lang}/dirijase_al.mp3`);
        const audioModulo = new Audio(`/audio/${lang}/${data.moduleId}.mp3`);
        
        // Estructura para reproducir secuencialmente, ignorando errores (404) si faltan archivos nuevos
        const sequence = [
          audioTurno, 
          audioLetter, 
          audioNumber, 
          audioDirijase, 
          audioModulo
        ];
        
        let currentIndex = 0;
        
        const playNextInSequence = () => {
          if (currentIndex >= sequence.length) {
            resolve();
            return;
          }
          
          const currentAudio = sequence[currentIndex];
          currentIndex++;
          
          currentAudio.play().catch(e => {
            console.warn(`Audio faltante o error: ${currentAudio.src}`, e);
            // Si falla, pasamos inmediatamente al siguiente
            playNextInSequence();
          });
          
          currentAudio.onended = () => {
            playNextInSequence();
          };
          currentAudio.onerror = () => {
            console.warn(`Audio no encontrado (404): ${currentAudio.src}`);
            playNextInSequence();
          };
        };

        playNextInSequence();
      } catch (e) {
        console.error(e);
        resolve(); // resolver siempre para no bloquear la cola
      }
    });
  };

  const playNext = async (turnData) => {
    isPlayingRef.current = true;
    setCurrentPlaying(turnData);
    
    if (globalConfig.audioEnabled) {
      await playAudioSequence(turnData);
      // Pequeña pausa extra después de terminar de hablar
      await new Promise(r => setTimeout(r, 1000));
    } else {
      // Si el audio está apagado, dejarlo en pantalla unos 4 segundos
      await new Promise(r => setTimeout(r, 4000));
    }
    
    // Terminar
    setQueue(prev => prev.slice(1));
    
    // Mover al historial (evitando duplicados si era "Repetir llamado" y ya estaba)
    setHistory(prev => {
      const filtered = prev.filter(item => !(item.letter === turnData.letter && item.number === turnData.number && item.moduleId === turnData.moduleId));
      return [turnData, ...filtered].slice(0, 5); // Mantener máximo 5
    });
    
    setCurrentPlaying(null);
    isPlayingRef.current = false;
  };

  const handleStart = () => {
    // Truco para desbloquear el autoplay del navegador
    const unlockAudio = new Audio('/audio/es/turno.mp3');
    unlockAudio.volume = 0;
    unlockAudio.play().then(() => {
      unlockAudio.pause();
    }).catch(e => console.log('Unlock failed', e));
    
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="viewer-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className="blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <button 
          className="btn primary massive active-press"
          onClick={handleStart}
          style={{zIndex: 10, fontSize: '2rem', padding: '2rem 4rem'}}
        >
          Iniciar Pantalla 🔊
        </button>
      </div>
    );
  }

  const displayData = currentPlaying || history[0];

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const dateString = `${dayNames[time.getDay()]}, ${time.getDate()} de ${monthNames[time.getMonth()]}`;
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');

  return (
    <div 
      className="h-full text-slate-800 font-sans flex flex-col justify-between select-none overflow-hidden antialiased"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at 20% 20%, rgba(224, 238, 255, 0.7) 0%, rgba(241, 246, 253, 0.8) 45%, rgba(235, 243, 253, 0.95) 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <main className="w-full h-full flex flex-col justify-between px-4 py-2 gap-1.5 relative overflow-hidden">
        
        {/* 1. BANNER SUPERIOR INSTITUCIONAL (Compacto y equilibrado para 720p) */}
        <header className="w-full relative z-20 flex-shrink-0" data-purpose="screen-header">
          <div className="w-full rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 px-5 py-1.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200/80 bg-white">
                <img alt="Hospital de Yumbel" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnlb_Qek0e-k-UYeE3t5ZspyVUV1JKd7q2PrDfISINdEgDiEAQxBazBDTZ6DbFQJtfEbM1BKTFNAmCOGk6DHHa-xyqFVD_B8wfVLt6NkAjYw9fXfSTtvzp9XAeEecdGvKAsEaO5DBhWugyKPaZOSulylIuVy3v20xOgzxz-oGJe9LcDcX4OCWe4RQfGosf53mUP9xGTVx3bpqn-Svo5N4IxP4oRihjGMmBmAaQIwvYq-yoEh5PjPHju8XJW45ZSdSTJREWFSNN9KjjzPk" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-2xl font-display font-black tracking-tight text-slate-900 leading-none m-0">Hospital de Yumbel</h1>
                </div>
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1 flex items-center gap-1.5 m-0">Sistema de Atención y Espera</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="text-lg lg:text-xl font-bold text-slate-700 tracking-wide select-none">{dateString}</span>
                </div>
                <div className="h-7 w-px bg-slate-200"></div>
                <div className="flex items-baseline gap-1.5 font-display font-bold select-none leading-none pl-1">
                  <span className="text-4xl lg:text-5xl tracking-tight font-black tabular-nums text-slate-900 leading-none drop-shadow-sm">{hours}:{minutes}</span>
                  <span className="text-sm lg:text-base font-black text-teal-700 tracking-wider">HRS</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 2. SECCIÓN PRINCIPAL DE TURNOS ACTIVOS (Ajustada proporcionalmente a 720p) */}
        <section className="w-full flex-1 flex flex-col justify-center relative z-20 min-h-0">
          {loading ? (
            <div className="w-full h-full rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-display-card flex flex-col justify-center items-center">
              <div className="text-2xl text-teal-700 font-bold animate-pulse">Cargando...</div>
            </div>
          ) : displayData ? (
            <div className="w-full h-full rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-display-card flex flex-col justify-between relative overflow-hidden px-5 py-1.5">
              
              <div className="absolute top-0 inset-x-0 h-1.5 overflow-hidden z-20">
                <div className="w-full h-full" style={{
                  background: 'linear-gradient(90deg, #0d9488 0%, #06b6d4 25%, #10b981 50%, #0ea5e9 75%, #0d9488 100%)', 
                  backgroundSize: '200% 100%', 
                  animation: 'accentFlow 4s linear infinite', 
                  boxShadow: '0 1px 6px rgba(13, 148, 136, 0.4)'
                }}></div>
              </div>
              
              <div className="flex items-center justify-center gap-2 py-1 border-b border-slate-200/70 w-full bg-slate-50/60 rounded-xl backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="font-display font-black tracking-widest uppercase text-[#0f172a] leading-none select-none drop-shadow-sm" style={{fontSize: 'clamp(2.8rem, 4vw, 4.1rem)', fontWeight: 900, WebkitTextStroke: '1.5px rgb(15, 23, 42)'}}>TURNO ACTUAL</span>
                <span className="font-display font-black tracking-widest uppercase text-teal-800 leading-none select-none drop-shadow-sm" style={{fontSize: 'clamp(2.8rem, 4vw, 4.1rem)', fontWeight: 900, WebkitTextStroke: '1.5px rgb(17, 94, 89)'}}>UNIDAD DE SOME</span>
              </div>
              
              <div className="flex-1 flex items-stretch justify-between w-full h-full px-4 lg:px-6 py-0 gap-6 my-auto relative">
                <div className="flex flex-col items-center justify-between text-center h-full pr-6 lg:pr-8 py-0.5" style={{flex: '1.7 1 0%'}}>
                  <div className="w-full">
                    <span className="flex items-center justify-center w-full font-black tracking-wider text-slate-800 uppercase bg-gradient-to-b from-white to-slate-100/90 px-4 py-1.5 rounded-xl border border-slate-200/90 leading-none text-center shadow-sm" style={{fontSize: 'clamp(1.1rem, 1.5vw, 1.6rem)', marginTop: '0.35rem'}}>NÚMERO DE TURNO</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-0.5">
                    <span className={`font-display font-black text-[#0f172a] tracking-normal select-none leading-none tabular-nums whitespace-nowrap drop-shadow-sm ${currentPlaying ? 'text-teal-700 transition-colors duration-300' : 'transition-colors duration-300'}`} style={{fontSize: 'clamp(8.5rem, 15vw, 13.5rem)', fontWeight: 900, lineHeight: 0.85}}>
                      {displayData.letter} - {displayData.number.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                
                <div className="w-px my-3 bg-gradient-to-b from-transparent via-slate-200 to-transparent flex-shrink-0"></div>
                
                <div className="flex-1 flex flex-col items-center justify-between text-center h-full pl-6 lg:pl-8 py-0.5">
                  <div className="w-full">
                    <span className="flex items-center justify-center w-full font-black tracking-wider text-teal-800 uppercase bg-gradient-to-b from-teal-50/90 to-teal-100/50 px-4 py-1.5 rounded-xl border border-teal-200/90 leading-none text-center shadow-sm" style={{fontSize: 'clamp(1.1rem, 1.5vw, 1.6rem)', marginTop: '0.35rem'}}>MÓDULO</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-0.5">
                    <span className="font-display font-black text-teal-700 tracking-tight leading-none uppercase select-none tabular-nums drop-shadow-sm" style={{fontSize: 'clamp(8.5rem, 15vw, 13.5rem)', fontWeight: 900, lineHeight: 0.85}}>
                      {displayData.moduleName ? displayData.moduleName.replace(/m[óo]dulo\s*/i, '') : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center pb-1">
                <div className="px-5 py-1 rounded-full bg-slate-50/80 border border-slate-200/80 flex items-center gap-2 shadow-sm">
                  <span className="text-lg lg:text-2xl text-slate-800 font-bold tracking-normal text-center leading-tight drop-shadow-sm">Por favor acérquese a la ventanilla indicada</span>
                </div>
              </div>
              
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-display-card flex flex-col justify-center items-center opacity-70">
              <h1 className="text-3xl font-black text-slate-400 m-0">Esperando llamados...</h1>
            </div>
          )}
        </section>

        {/* 3. SECCIÓN INFERIOR DE ÚLTIMOS TURNOS LLAMADOS (Cards ampliadas con tipografía maximizada) */}
        <footer className="w-full relative z-20 flex-shrink-0" data-purpose="history-and-system-status">
          <div className="w-full bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl shadow-sm flex flex-col gap-2 py-2.5 px-4">
            
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
                <span className="text-xl lg:text-2xl font-black uppercase tracking-wider text-slate-800 leading-none m-0">ÚLTIMOS TURNOS LLAMADOS</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2.5 w-full">
              {history
                .filter(item => currentPlaying ? true : item !== history[0])
                .slice(0, 4)
                .map((item, index) => (
                <div key={`${item.letter}-${item.number}-${item.moduleId}-${index}`} className="flex flex-col items-center justify-center py-2 px-3 rounded-xl bg-white border border-slate-200/90 shadow-sm transition-all gap-1.5">
                  <span className="font-display font-black tracking-tight text-slate-900 tabular-nums leading-none select-none drop-shadow-sm" style={{fontSize: 'clamp(3.6rem, 5.2vw, 5.2rem)', fontWeight: 900, lineHeight: 0.88}}>
                    {item.letter} - {item.number.toString().padStart(2, '0')}
                  </span>
                  <span className="w-full text-center font-medium uppercase px-2 py-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/90 tracking-wider shadow-sm leading-none select-none" style={{fontSize: 'clamp(1.75rem, 2.5vw, 2.6rem)', letterSpacing: '0.05em'}}>
                    {(() => {
                      const parts = (item.moduleName || '').split(' ');
                      if (parts.length > 1) {
                        const last = parts.pop();
                        return <>{parts.join(' ')} <span className="font-black" style={{fontWeight: 900}}>{last}</span></>;
                      }
                      return item.moduleName;
                    })()}
                  </span>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="col-span-4 text-center py-3 text-slate-400 font-semibold text-lg">
                  Sin historial aún.
                </div>
              )}
            </div>
            
          </div>
        </footer>
      </main>
      
      <style>{`
        @keyframes accentFlow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
      `}</style>
    </div>
  );
}
