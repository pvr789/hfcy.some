import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { statusRef } from '../lib/modules';
import { readSchedule, isWithinSchedule, msUntilNextChange } from '../lib/schedule';

// Estado del sistema en tiempo real: interruptor de Jefatura (isOpen) + horario.
//   manualOpen: el interruptor "Sistema abierto" · inSchedule: la hora está dentro del horario
//   open: estado efectivo (los operadores solo pueden trabajar si es true)
// Se vuelve a evaluar justo en la hora de apertura o cierre, cada minuto y al volver a la pestaña.
export default function useSystemStatus() {
  const [status, setStatus] = useState(null); // null mientras carga
  const [now, setNow] = useState(() => new Date());

  useEffect(() => onSnapshot(statusRef(), (snap) => setStatus(snap.exists() ? snap.data() : {})), []);

  const { enabled, open, close } = readSchedule(status);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const ms = msUntilNextChange({ enabled, open, close }, new Date());
    const timer = ms === null ? null : setTimeout(tick, ms + 250);
    const interval = setInterval(tick, 60000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [enabled, open, close, now]);

  const schedule = { enabled, open, close };
  const manualOpen = status ? status.isOpen !== false : true;
  const inSchedule = isWithinSchedule(schedule, now);
  return { loaded: status !== null, manualOpen, inSchedule, open: manualOpen && inSchedule, schedule };
}
