// Horario del sistema (se guarda en system/status):
//   scheduleEnabled (bool) · openTime y closeTime ("HH:MM", hora local del equipo)
// Con el horario activo, el sistema solo está abierto entre la apertura y el cierre, todos los días.
export const DEFAULT_SCHEDULE = { enabled: false, open: '08:00', close: '17:00' };

export const readSchedule = (status) => ({
  enabled: status?.scheduleEnabled === true,
  open: status?.openTime || DEFAULT_SCHEDULE.open,
  close: status?.closeTime || DEFAULT_SCHEDULE.close,
});

const toMinutes = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
};

export const isValidTime = (hhmm) => toMinutes(hhmm) !== null;

// Campo de hora en formato 24 h (el selector nativo del navegador puede mostrar "a. m./p. m.").
// Mientras se escribe: solo dígitos y los dos puntos se agregan solos ("0830" → "08:30").
export const typeTime = (value) => {
  if (value.includes(':')) {
    const [h, m = ''] = value.split(':');
    return `${h.replace(/\D/g, '').slice(0, 2)}:${m.replace(/\D/g, '').slice(0, 2)}`;
  }
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};

// Al salir del campo o guardar: "8:30" → "08:30" y "17" → "17:00". Si no es una hora válida, queda igual.
export const normalizeTime = (value) => {
  const minutes = toMinutes(/^\d{1,2}$/.test(value) ? `${value}:00` : value);
  if (minutes === null) return value;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};

// Texto para mensajes: "de 08:00 a 17:00" (o "de 20:00 a 08:00 del día siguiente" si cruza la medianoche).
export const describeSchedule = ({ open, close }) =>
  `de ${open} a ${close}${toMinutes(close) < toMinutes(open) ? ' del día siguiente' : ''}`;

// ¿`now` cae dentro del horario? Sin horario activo (o con uno inválido) no se restringe nada.
export function isWithinSchedule(schedule, now = new Date()) {
  if (!schedule.enabled) return true;
  const open = toMinutes(schedule.open);
  const close = toMinutes(schedule.close);
  if (open === null || close === null || open === close) return true;
  const t = now.getHours() * 60 + now.getMinutes();
  return open < close ? t >= open && t < close : t >= open || t < close; // admite horarios que cruzan la medianoche
}

// Milisegundos hasta la próxima apertura o cierre (null si no hay horario activo).
export function msUntilNextChange(schedule, now = new Date()) {
  if (!schedule.enabled) return null;
  const marks = [toMinutes(schedule.open), toMinutes(schedule.close)].filter((v) => v !== null);
  if (!marks.length) return null;
  return Math.min(...marks.map((m) => {
    const at = new Date(now.getTime());
    at.setHours(Math.floor(m / 60), m % 60, 0, 0);
    if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
    return at.getTime() - now.getTime();
  }));
}
