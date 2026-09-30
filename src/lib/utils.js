import { RUT_EMAIL_DOMAIN, QUEUE_LETTERS } from './constants';

// Normaliza un RUT mientras se escribe: deja solo dígitos/K y agrega el guion antes del DV.
export const formatRut = (value) => {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
};

// "12987654-1" -> "12.987.654-1" (solo para mostrar; se guarda sin puntos)
export const formatRutDisplay = (rut = '') => {
  const [body, dv] = String(rut).split('-');
  if (!dv) return rut;
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};

export const rutToEmail = (rut) => `${rut}@${RUT_EMAIL_DOMAIN}`;

// "A", 5 -> "A-05"
export const formatTurn = (letter, number) =>
  `${letter || 'A'}-${String(Math.max(0, number ?? 0)).padStart(2, '0')}`;

// Turno que sigue en la fila global: al pasar del 99 vuelve a 1 con la letra siguiente (A→E).
export const nextTurn = (letter = 'A', number = 0) => {
  if (number + 1 <= 99) return { letter, number: number + 1 };
  const i = QUEUE_LETTERS.indexOf(letter);
  return { letter: QUEUE_LETTERS[(i + 1) % QUEUE_LETTERS.length], number: 1 };
};

// "María González" -> "MG"
export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
