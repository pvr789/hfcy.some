import { useEffect, useState } from 'react';
import { DAY_NAMES, MONTH_NAMES } from '../lib/constants';

// Reloj en vivo: { date: 'Martes, 29 de Septiembre', time: '12:16' }
export default function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    date: `${DAY_NAMES[now.getDay()]}, ${now.getDate()} de ${MONTH_NAMES[now.getMonth()]}`,
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  };
}
