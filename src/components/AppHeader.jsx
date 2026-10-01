import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useArea } from '../lib/theme';
import useClock from '../hooks/useClock';
import Logo from './ui/Logo';
import Button from './ui/Button';
import Avatar from './ui/Avatar';

// ¿La página ya se desplazó? (para la sombra de la cabecera fija)
function useScrolled(threshold = 4) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

// Cabecera de los paneles: queda fija arriba al hacer scroll.
// Operadores: blanca con línea azul→índigo. Administración: negra.
// Debe ir como hijo directo de la página (no dentro de otra franja); si no, deja de quedar fija.
// user: { name, detail } · children: controles extra antes del usuario (ej. estado del sistema)
export default function AppHeader({ user, onLogout, children }) {
  const area = useArea();
  const dark = area.key === 'admin';
  const { date, time } = useClock();
  const scrolled = useScrolled();
  const shadow = scrolled ? (dark ? 'shadow-lg shadow-slate-950/30' : 'shadow-md shadow-slate-900/5') : '';

  return (
    <header className={`sticky top-0 z-30 transition-shadow duration-200 ${shadow} ${dark ? 'bg-slate-950 text-white' : 'border-b border-slate-200/80 bg-white/95 text-slate-900 backdrop-blur'}`}>
      {!dark && <div className={`h-[3px] ${area.accentLine}`} />}
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size={40} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-semibold">Hospital de Yumbel</p>
            <p className={`truncate text-[11px] font-medium uppercase tracking-[0.12em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sistema de Atención y Espera
            </p>
          </div>
          <span className={`ml-2 hidden whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold md:inline-flex ${area.chip}`}>{area.name}</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`hidden items-center gap-3 whitespace-nowrap lg:flex ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
            <span className="hidden text-[13px] font-medium xl:inline">{date}</span>
            <span className={`hidden h-5 w-px xl:inline-block ${dark ? 'bg-white/15' : 'bg-slate-200'}`} />
            <span className={`font-display text-lg font-semibold tabular-nums ${dark ? 'text-white' : 'text-slate-900'}`}>
              {time}
              <span className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">hrs</span>
            </span>
          </div>
          {children}
          {user && (
            <div className={`hidden items-center gap-2.5 whitespace-nowrap border-l pl-4 sm:flex ${dark ? 'border-white/10' : 'border-slate-200'}`}>
              <Avatar name={user.name} tone={dark ? 'muted' : 'operator'} size="sm" />
              <div className="leading-tight">
                <p className="text-[13px] font-semibold">{user.name}</p>
                {user.detail && <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{user.detail}</p>}
              </div>
            </div>
          )}
          <Button variant={dark ? 'ghost-dark' : 'secondary'} size="sm" onClick={onLogout}>
            <LogOut size={15} />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
