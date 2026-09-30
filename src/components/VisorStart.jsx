import { MonitorPlay, Volume2 } from 'lucide-react';
import { AREAS, AreaContext } from '../lib/theme';
import Logo from './ui/Logo';
import Button from './ui/Button';

// Pantalla previa del visor (verde). El navegador exige un clic antes de reproducir audio.
export default function VisorStart({ onStart }) {
  return (
    <AreaContext.Provider value="visor">
      <div className="ui-root relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(16,185,129,0.16),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(20,184,166,0.14),transparent_42%)]"
        />
        <div className="ui-fade-up relative w-full max-w-md text-center">
          <Logo size={76} className="mx-auto shadow-md" />
          <span className={`mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${AREAS.visor.chip}`}>
            <MonitorPlay size={14} />
            Visor de sala
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Pantalla de turnos</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            Muestra y anuncia los turnos en la sala de espera. Presiona el botón para activar la pantalla y el sonido.
          </p>
          <Button size="xl" block className="mt-8" onClick={onStart}>
            <Volume2 size={22} />
            Iniciar pantalla
          </Button>
          <p className="mt-4 text-xs text-slate-400">Sugerencia: en el televisor usa pantalla completa (tecla F11).</p>
        </div>
      </div>
    </AreaContext.Provider>
  );
}
