import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';

const TONES = {
  success: { icon: CircleCheck, cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', role: 'status' },
  error: { icon: CircleAlert, cls: 'border-rose-200 bg-rose-50 text-rose-700', role: 'alert' },
  warning: { icon: TriangleAlert, cls: 'border-amber-200 bg-amber-50 text-amber-800', role: 'status' },
};

export default function Alert({ tone = 'success', className = '', children }) {
  const { icon: Icon, cls, role } = TONES[tone] || TONES.success;
  return (
    <div role={role} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${cls} ${className}`}>
      <Icon size={18} className="mt-px shrink-0" />
      <span>{children}</span>
    </div>
  );
}
