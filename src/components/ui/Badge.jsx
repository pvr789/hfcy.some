const TONES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  info: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  dark: 'bg-slate-900 text-white ring-slate-900',
};
const DOTS = {
  success: 'bg-emerald-500',
  neutral: 'bg-slate-400',
  info: 'bg-indigo-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  dark: 'bg-white',
};

export default function Badge({ tone = 'neutral', dot = false, className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone]}`} />}
      {children}
    </span>
  );
}
