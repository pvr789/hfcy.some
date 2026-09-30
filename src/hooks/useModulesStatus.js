import { useEffect, useState } from 'react';
import { FIXED_MODULES } from '../lib/constants';
import { subscribeModules } from '../lib/modules';

// Estado en tiempo real de todos los módulos: { modulo_a: {...}, ... }
export default function useModulesStatus() {
  const [status, setStatus] = useState({});
  useEffect(
    () => subscribeModules(FIXED_MODULES, (id, data) => setStatus((prev) => ({ ...prev, [id]: data }))),
    []
  );
  return status;
}
