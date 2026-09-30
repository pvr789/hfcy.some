import { useArea } from '../../lib/theme';

// Interruptor accesible. tone="success" lo pinta verde; dark lo adapta a fondos oscuros.
export default function Toggle({ checked, onChange, tone, dark = false, label, disabled = false }) {
  const area = useArea();
  const on = tone === 'success' ? 'bg-emerald-500' : area.toggleOn;
  const off = dark ? 'bg-white/20' : 'bg-slate-300';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? on : off}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}
