import { initials } from '../../lib/utils';

const TONES = {
  dark: 'bg-slate-900 text-white',
  muted: 'bg-slate-200 text-slate-500',
  operator: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white',
};
const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-[13px]', lg: 'h-11 w-11 text-sm' };

export default function Avatar({ name, tone = 'dark', size = 'md' }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold tracking-wide ${TONES[tone]} ${SIZES[size]}`}>
      {initials(name) || '?'}
    </span>
  );
}
