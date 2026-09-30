import { useArea } from '../../lib/theme';

export function Card({ className = '', children, ...rest }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-card ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function CardHeader({ icon: Icon, title, description, action, className = '' }) {
  const area = useArea();
  return (
    <div className={`flex items-start justify-between gap-4 px-6 pt-5 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${area.iconSoft}`}>
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-6 text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] leading-5 text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
