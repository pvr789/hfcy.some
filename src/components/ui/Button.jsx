import { useArea } from '../../lib/theme';

const BASE = 'inline-flex items-center justify-center font-semibold whitespace-nowrap select-none transition duration-150 focus:outline-none focus-visible:ring-4 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0';

const SIZES = {
  sm: 'h-9 px-3 gap-1.5 rounded-lg text-[13px]',
  md: 'h-10 px-4 gap-2 rounded-xl text-sm',
  lg: 'h-12 px-5 gap-2 rounded-xl text-[15px]',
  xl: 'h-16 px-6 gap-3 rounded-2xl text-lg',
};

const FIXED = {
  secondary: 'text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-900/10',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-900/10',
  'ghost-dark': 'text-slate-300 hover:text-white hover:bg-white/10 focus-visible:ring-white/20',
  danger: 'text-white bg-rose-600 hover:bg-rose-500 shadow-sm focus-visible:ring-rose-500/25',
};

// variant: primary | soft (según el área) · secondary | ghost | ghost-dark | danger
export default function Button({ variant = 'primary', size = 'md', block = false, type = 'button', className = '', children, ...rest }) {
  const area = useArea();
  const look = variant === 'primary' ? area.primaryBtn : variant === 'soft' ? area.softBtn : FIXED[variant];
  return (
    <button type={type} className={`${BASE} ${SIZES[size]} ${look} ${block ? 'w-full' : ''} ${className}`} {...rest}>
      {children}
    </button>
  );
}
