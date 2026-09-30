import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Lock } from 'lucide-react';
import { AREAS, AreaContext } from '../lib/theme';
import Logo from './ui/Logo';
import Button from './ui/Button';
import Alert from './ui/Alert';
import { Input, Label } from './ui/Field';

// Inicio de sesión compartido. area="operator" (azul→índigo) o area="admin" (negro).
// authenticate(identificador, contraseña) debe lanzar un error si las credenciales fallan.
export default function LoginForm({
  area = 'operator',
  icon,
  heroTitle,
  heroText,
  title,
  subtitle,
  label,
  placeholder,
  fieldIcon,
  formatValue,
  maxLength,
  errorMessage,
  footnote,
  authenticate,
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = AREAS[area];
  const dark = area === 'admin';
  const AreaIcon = icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authenticate(identifier.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AreaContext.Provider value={area}>
      <div className="ui-root grid min-h-screen bg-white lg:grid-cols-2">
        {/* Panel de marca con el color del área */}
        <aside className={`relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between ${theme.heroPanel}`}>
          <HeroDecor dark={dark} />
          <div className="relative flex items-center gap-3">
            <Logo size={52} className="shadow-lg shadow-black/20" />
            <div className="leading-tight">
              <p className="text-[15px] font-semibold">Hospital de Yumbel</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">Sistema de Atención y Espera</p>
            </div>
          </div>
          <div className="relative max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/20">
              <AreaIcon size={14} />
              {theme.name}
            </span>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.1] tracking-tight">{heroTitle}</h1>
            <p className="mt-4 text-base leading-relaxed text-white/70">{heroText}</p>
          </div>
          <p className="relative text-xs text-white/50">SOME · Hospital de la Familia y Comunidad de Yumbel</p>
        </aside>

        {/* Formulario */}
        <main className="flex min-h-screen flex-col px-6 py-8 sm:px-12">
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>

          <div className="ui-fade-up mx-auto my-auto w-full max-w-[380px] py-10">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <Logo size={40} />
              <p className="font-semibold text-slate-900">Hospital de Yumbel</p>
            </div>
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${theme.tile}`}>
              <AreaIcon size={22} />
            </span>
            <h2 className="mt-6 text-[28px] font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1.5 text-[15px] text-slate-500">{subtitle}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && <Alert tone="error">{error}</Alert>}
              <div>
                <Label htmlFor="login-id">{label}</Label>
                <Input
                  id="login-id"
                  icon={fieldIcon}
                  value={identifier}
                  onChange={(e) => setIdentifier(formatValue ? formatValue(e.target.value.trim()) : e.target.value)}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-pass">Contraseña</Label>
                <Input
                  id="login-pass"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
              </div>
              <Button type="submit" size="lg" block disabled={loading}>
                {loading ? <LoaderCircle size={18} className="animate-spin" /> : null}
                {loading ? 'Validando…' : 'Ingresar'}
                {loading ? null : <ArrowRight size={18} />}
              </Button>
            </form>

            {footnote && <p className="mt-6 text-center text-[13px] text-slate-500">{footnote}</p>}
          </div>

          <p className="text-center text-xs text-slate-400">© 2026 Hospital de Yumbel · Sistema de Turnos SOME</p>
        </main>
      </div>
    </AreaContext.Provider>
  );
}

function HeroDecor({ dark }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className={`absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full blur-3xl ${dark ? 'bg-slate-600/25' : 'bg-violet-500/40'}`} />
      <div className={`absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full blur-3xl ${dark ? 'bg-slate-800/60' : 'bg-sky-400/30'}`} />
      <div className="absolute -bottom-56 -right-56 h-[680px] w-[680px] rounded-full border border-white/10" />
      <div className="absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full border border-white/10" />
      {dark && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:48px_48px] [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_70%)]" />
      )}
    </div>
  );
}
