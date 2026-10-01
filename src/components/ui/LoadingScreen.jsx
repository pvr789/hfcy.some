import { LoaderCircle } from 'lucide-react';
import Logo from './Logo';

export default function LoadingScreen({ label = 'Cargando…' }) {
  return (
    <div className="ui-root grid min-h-screen place-items-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <Logo size={112} />
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
          <LoaderCircle size={18} className="animate-spin text-slate-400" />
          {label}
        </div>
      </div>
    </div>
  );
}
