import { Link } from 'react-router-dom';
import { ArrowRight, IdCard, MonitorPlay, ShieldCheck } from 'lucide-react';
import { LOGO_URL } from '../lib/constants';

// Cada acceso lleva el color de su área: administración (negro), operadores (azul→índigo) y visor (verde).
const ENTRIES = [
  {
    to: '/loginS',
    icon: ShieldCheck,
    title: 'Ingreso Administración',
    text: 'Gestión global y configuración',
    card: 'bg-slate-900 hover:bg-slate-800 border-slate-800/80 hover:shadow-slate-900/20',
    iconBox: 'bg-white/10 border-white/10 group-hover:bg-white/15',
    sub: 'text-slate-400',
    arrow: 'bg-white/5 group-hover:bg-white/15',
  },
  {
    to: '/login',
    icon: IdCard,
    title: 'Ingreso Operadores',
    text: 'Atención y llamado de pacientes',
    card: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-400/30 hover:shadow-blue-600/25',
    iconBox: 'bg-white/15 border-white/15 group-hover:bg-white/25',
    sub: 'text-blue-100',
    arrow: 'bg-white/15 group-hover:bg-white/25',
  },
  {
    to: '/visor',
    icon: MonitorPlay,
    title: 'Abrir Visor Público',
    text: 'Pantalla de turnos para sala TV',
    card: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 hover:shadow-emerald-600/25',
    iconBox: 'bg-white/15 border-white/15 group-hover:bg-white/25',
    sub: 'text-emerald-100',
    arrow: 'bg-white/15 group-hover:bg-white/25',
  },
];

export default function Home() {
  return (
    <main className="ui-root hero-glow-bg flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 selection:bg-indigo-500 selection:text-white">
      <style>{`
        .hero-glow-bg {
          background-color: #f8fafc;
          background-image:
            radial-gradient(circle at 18% 46%, rgba(191, 219, 254, 0.55) 0%, rgba(219, 234, 254, 0.35) 28%, rgba(241, 245, 249, 0.1) 60%),
            radial-gradient(circle at 85% 20%, rgba(243, 244, 246, 0.6) 0%, transparent 45%);
        }
      `}</style>

      <section className="ui-fade-up flex w-full max-w-[580px] flex-col items-center text-center">
        <div className="group relative mb-5">
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-sky-400/20 via-teal-300/20 to-blue-500/20 opacity-70 blur-md transition duration-500 group-hover:opacity-100"></div>
          <img alt="Hospital de Yumbel" src={LOGO_URL} className="relative h-[76px] w-[76px] rounded-full shadow-md" />
        </div>

        <h1 className="font-display text-[23px] font-bold leading-snug tracking-tight text-slate-900">Sistema de Turnos SOME</h1>
        <p className="mt-1.5 max-w-[340px] text-[12.5px] leading-relaxed text-slate-500">Plataforma de Control Operativo y Visor de Sala</p>

        <nav aria-label="Opciones de acceso" className="mt-7 flex w-full max-w-[380px] flex-col gap-2.5">
          {ENTRIES.map(({ to, icon, title, text, card, iconBox, sub, arrow }) => {
            const Icon = icon;
            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex items-center justify-between overflow-hidden rounded-xl border px-3.5 py-2.5 text-left text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${card}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition duration-200 ${iconBox}`}>
                    <Icon size={17} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold tracking-tight">{title}</span>
                    <span className={`mt-0.5 text-[11px] leading-tight ${sub}`}>{text}</span>
                  </div>
                </div>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition duration-200 ${arrow}`}>
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </nav>

        <p className="mt-8 text-[11px] text-slate-400">Hospital de la Familia y Comunidad de Yumbel · v1.0</p>
      </section>
    </main>
  );
}
