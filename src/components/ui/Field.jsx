import { ChevronDown } from 'lucide-react';
import { useArea } from '../../lib/theme';

const FIELD = 'w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

// compact: versión más baja para bloques secundarios dentro de una tarjeta (ej. el horario del sistema)
export function Label({ htmlFor, hint, compact = false, children }) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 flex items-baseline justify-between gap-2 font-medium text-slate-700 ${compact ? 'text-[12px]' : 'text-[13px]'}`}>
      {children}
      {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
    </label>
  );
}

// icon: icono de lucide a la izquierda · trailing: elemento a la derecha (ej. botón "ver contraseña")
export function Input({ icon: Icon, trailing, compact = false, className = '', ...rest }) {
  const area = useArea();
  return (
    <div className="relative">
      {Icon && <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input className={`${FIELD} ${compact ? 'h-10' : 'h-11'} ${area.focus} ${Icon ? 'pl-10' : 'pl-3.5'} ${trailing ? 'pr-12' : 'pr-3.5'} ${className}`} {...rest} />
      {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}

export function Select({ className = '', children, ...rest }) {
  const area = useArea();
  return (
    <div className="relative">
      <select className={`${FIELD} h-11 ${area.focus} cursor-pointer appearance-none pl-3.5 pr-10 ${className}`} {...rest}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
