import { useState } from 'react';
import { updateDoc } from 'firebase/firestore';
import { SlidersHorizontal } from 'lucide-react';
import { ALL_LETTERS } from '../lib/constants';
import { configRef } from '../lib/modules';
import { formatTurn } from '../lib/utils';
import { useArea } from '../lib/theme';
import { Card, CardHeader } from './ui/Card';
import { Input, Label, Select } from './ui/Field';
import Button from './ui/Button';
import Alert from './ui/Alert';

// "Ajuste manual" compartido por Administración y Operadores: fija el PRÓXIMO turno de la fila global.
// children: contenido extra al pie de la tarjeta (en Administración, el horario del sistema).
export default function ManualTurnCard({ currentLetter, currentNumber, className = '', children }) {
  const area = useArea();
  const [letter, setLetter] = useState('A');
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState(null);

  const showStatus = (tone, text) => {
    setStatus({ tone, text });
    setTimeout(() => setStatus(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseInt(number, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      showStatus('error', 'Ingresa un número entre 1 y 99.');
      return;
    }
    const label = formatTurn(letter, num);
    if (!window.confirm(`¿Fijar el próximo turno global en ${label}? Todos los módulos continuarán desde este número.`)) return;
    try {
      // Se guarda num - 1 porque "Siguiente turno" suma 1 antes de llamar.
      await updateDoc(configRef(), { globalTurnLetter: letter, globalTurnNumber: num - 1 });
      setNumber('');
      showStatus('success', `Listo: el próximo turno será ${label}.`);
    } catch (err) {
      console.error(err);
      showStatus('error', 'No se pudo fijar el turno. Intenta nuevamente.');
    }
  };

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader icon={SlidersHorizontal} title="Ajuste manual" description="Corrige la fila si se produjo un salto de números." />
      <div className="flex flex-1 flex-col justify-between gap-6 px-6 pb-6 pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200/70">
            <span className="text-[13px] font-medium text-slate-500">Último turno llamado</span>
            <span className="font-display text-xl font-bold tracking-wide text-slate-900">{formatTurn(currentLetter, currentNumber)}</span>
          </div>
          <div className="grid grid-cols-[104px_1fr] gap-3">
            <div>
              <Label htmlFor="mt-letter">Letra</Label>
              <Select id="mt-letter" value={letter} onChange={(e) => setLetter(e.target.value)}>
                {ALL_LETTERS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="mt-number">Próximo número</Label>
              <Input
                id="mt-number"
                inputMode="numeric"
                placeholder="1 – 99"
                maxLength={2}
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
              />
            </div>
          </div>
          {status && <Alert tone={status.tone}>{status.text}</Alert>}
          <Button type="submit" variant={area.key === 'admin' ? 'primary' : 'soft'} size="lg" block>
            Fijar próximo turno
          </Button>
        </form>
        {children}
      </div>
    </Card>
  );
}
