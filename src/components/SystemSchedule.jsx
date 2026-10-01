import { useRef, useState } from 'react';
import { setDoc } from 'firebase/firestore';
import { statusRef } from '../lib/modules';
import { describeSchedule, isValidTime, isWithinSchedule, normalizeTime, typeTime } from '../lib/schedule';
import { Input, Label } from './ui/Field';
import Toggle from './ui/Toggle';
import Button from './ui/Button';
import Alert from './ui/Alert';

// Horario del sistema (al pie de "Ajuste manual" en Administración).
// Activo: el sistema abre y cierra solo todos los días, según la hora de cada computador. Fuera de horario
// nadie puede ingresar como operador, y a la hora de cierre se desconecta a quienes estén atendiendo
// (igual que el cierre manual). schedule: { enabled, open, close } tal como está guardado.
export default function SystemSchedule({ schedule }) {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const notify = (tone, text) => {
    clearTimeout(timer.current);
    setMessage({ tone, text });
    timer.current = setTimeout(() => setMessage(null), 5000);
  };

  // El formulario se vuelve a montar cuando cambia el horario guardado: así los campos
  // parten siempre de los valores vigentes (el mensaje vive aquí para no perderse).
  return (
    <ScheduleForm
      key={`${schedule.enabled}-${schedule.open}-${schedule.close}`}
      schedule={schedule}
      message={message}
      notify={notify}
    />
  );
}

function ScheduleForm({ schedule, message, notify }) {
  const [open, setOpen] = useState(schedule.open);
  const [close, setClose] = useState(schedule.close);
  const [saving, setSaving] = useState(false);
  const draft = { enabled: true, open: normalizeTime(open), close: normalizeTime(close) };

  const problem = () => {
    if (!isValidTime(draft.open) || !isValidTime(draft.close)) return 'Ingresa la apertura y el cierre en formato 24 horas, por ejemplo 08:00 y 17:00.';
    if (draft.open === draft.close) return 'La apertura y el cierre no pueden ser a la misma hora.';
    return null;
  };

  const save = async (fields, successText) => {
    setSaving(true);
    try {
      await setDoc(statusRef(), fields, { merge: true });
      notify('success', successText);
    } catch (err) {
      console.error(err);
      notify('error', 'No se pudo guardar el horario. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (schedule.enabled) {
      if (!window.confirm('¿Desactivar el horario?\n\nEl sistema quedará abierto o cerrado solo con el interruptor de la cabecera.')) return;
      await save({ scheduleEnabled: false }, 'Horario desactivado.');
      return;
    }
    const error = problem();
    if (error) {
      notify('error', error);
      return;
    }
    let text = `¿Activar el horario?\n\nEl sistema atenderá ${describeSchedule(draft)}, todos los días. Fuera de ese horario nadie podrá ingresar como operador, y a la hora de cierre se desconectará a quienes estén atendiendo.`;
    if (!isWithinSchedule(draft)) text += '\n\nAhora mismo está fuera de ese horario: los operadores conectados se desconectarán de inmediato.';
    if (!window.confirm(text)) return;
    await save({ scheduleEnabled: true, openTime: draft.open, closeTime: draft.close }, `Horario activado: el sistema atiende ${describeSchedule(draft)}.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = problem();
    if (error) {
      notify('error', error);
      return;
    }
    // Si el nuevo horario deja el sistema cerrado en este momento, se avisa antes de desconectar a nadie.
    if (schedule.enabled && isWithinSchedule(schedule) && !isWithinSchedule(draft)) {
      if (!window.confirm(`Con este horario (${describeSchedule(draft)}) el sistema se cierra ahora mismo y los operadores conectados se desconectarán.\n\n¿Guardar de todas formas?`)) return;
    }
    await save(
      { openTime: draft.open, closeTime: draft.close },
      schedule.enabled
        ? `Horario guardado: ${describeSchedule(draft)}.`
        : `Horario guardado: ${describeSchedule(draft)}. Se aplicará cuando lo actives.`
    );
  };

  return (
    <div className="border-t border-slate-100 pt-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h4 className="text-[13px] font-semibold text-slate-900">Horario del sistema</h4>
          <p className="text-[11px] text-slate-400">Jornada de atención continuada SOME</p>
        </div>
        <Toggle checked={schedule.enabled} onChange={handleToggle} disabled={saving} label="Activar o desactivar el horario" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sch-open" compact>Apertura</Label>
            <Input
              id="sch-open"
              compact
              required
              inputMode="numeric"
              autoComplete="off"
              maxLength={5}
              placeholder="08:00"
              value={open}
              onChange={(e) => setOpen(typeTime(e.target.value))}
              onBlur={() => setOpen(normalizeTime(open))}
            />
          </div>
          <div>
            <Label htmlFor="sch-close" compact>Cierre</Label>
            <Input
              id="sch-close"
              compact
              required
              inputMode="numeric"
              autoComplete="off"
              maxLength={5}
              placeholder="17:00"
              value={close}
              onChange={(e) => setClose(typeTime(e.target.value))}
              onBlur={() => setClose(normalizeTime(close))}
            />
          </div>
        </div>
        {message && <Alert tone={message.tone}>{message.text}</Alert>}
        <Button type="submit" size="lg" block disabled={saving}>
          Guardar horario
        </Button>
      </form>
    </div>
  );
}
