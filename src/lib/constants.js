// Configuración compartida por todas las vistas.

// ¡IMPORTANTE! Correo del Super Administrador (RUT + dominio interno).
// Si lo cambias aquí, cámbialo también en firestore.rules.
export const SUPER_ADMIN_EMAIL = '17471333-2@some.cl';

// Dominio interno con el que se arma el "correo" de login a partir del RUT.
export const RUT_EMAIL_DOMAIN = 'some.cl';

// Logo del hospital (vectorizado desde el original; está en public/).
// La versión ícono para la pestaña del navegador es public/favicon.svg.
export const LOGO_URL = '/logo-hospital.svg';

export const FIXED_MODULES = [
  { id: 'modulo_a', name: 'Módulo A', letter: 'A' },
  { id: 'modulo_b', name: 'Módulo B', letter: 'B' },
  { id: 'modulo_c', name: 'Módulo C', letter: 'C' },
  { id: 'modulo_d', name: 'Módulo D', letter: 'D' },
  { id: 'modulo_e', name: 'Módulo E', letter: 'E' },
];

// Letras por las que rota la fila global al pasar del 99.
export const QUEUE_LETTERS = ['A', 'B', 'C', 'D', 'E'];

// Letras disponibles en el "Ajuste manual".
export const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
