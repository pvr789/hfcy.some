import { createContext, useContext } from 'react';

// Identidad de color por área (la misma que la portada):
//   operator → azul a índigo · visor → verde · admin → negro
// Todas las clases van completas para que Tailwind las detecte.
export const AREAS = {
  operator: {
    key: 'operator',
    name: 'Operadores',
    primaryBtn: 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-600/20 focus-visible:ring-indigo-500/25',
    softBtn: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus-visible:ring-indigo-500/20',
    gradientText: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
    tile: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25',
    iconSoft: 'bg-indigo-50 text-indigo-600',
    chip: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100',
    eyebrow: 'text-indigo-600',
    toggleOn: 'bg-indigo-600',
    focus: 'focus:border-indigo-400 focus:ring-indigo-500/10',
    accentLine: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600',
    wash: 'bg-gradient-to-b from-indigo-50/70 to-white',
    heroPanel: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800',
  },
  admin: {
    key: 'admin',
    name: 'Administración',
    primaryBtn: 'text-white bg-slate-950 hover:bg-slate-800 shadow-md shadow-slate-950/20 focus-visible:ring-slate-900/20',
    softBtn: 'text-slate-900 bg-slate-100 hover:bg-slate-200 focus-visible:ring-slate-900/15',
    gradientText: 'text-slate-950',
    tile: 'bg-slate-950 text-white shadow-md shadow-slate-950/20',
    iconSoft: 'bg-slate-100 text-slate-800',
    chip: 'bg-white/10 text-white ring-1 ring-inset ring-white/15',
    eyebrow: 'text-slate-400',
    toggleOn: 'bg-slate-900',
    focus: 'focus:border-slate-400 focus:ring-slate-900/5',
    accentLine: 'bg-slate-950',
    wash: 'bg-gradient-to-b from-slate-100/70 to-white',
    heroPanel: 'bg-slate-950',
  },
  visor: {
    key: 'visor',
    name: 'Visor',
    primaryBtn: 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 focus-visible:ring-emerald-500/25',
    softBtn: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus-visible:ring-emerald-500/20',
    gradientText: 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent',
    tile: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25',
    iconSoft: 'bg-emerald-50 text-emerald-600',
    chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
    eyebrow: 'text-emerald-700',
    toggleOn: 'bg-emerald-600',
    focus: 'focus:border-emerald-400 focus:ring-emerald-500/10',
    accentLine: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    wash: 'bg-gradient-to-b from-emerald-50/70 to-white',
    heroPanel: 'bg-gradient-to-br from-emerald-600 to-teal-700',
  },
};

// Cada vista declara su área con <AreaContext.Provider value="operator|admin|visor">
export const AreaContext = createContext('operator');
export const useArea = () => AREAS[useContext(AreaContext)] || AREAS.operator;
