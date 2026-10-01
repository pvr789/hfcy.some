import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FIXED_MODULES } from './constants';

// Documento Firestore de un módulo: system/modules_<id>
export const moduleRef = (moduleId) => doc(db, `system/modules_${moduleId}`);
export const configRef = () => doc(db, 'system/config');
export const statusRef = () => doc(db, 'system/status');
export const callsHistoryRef = () => collection(db, 'system/calls/history');

export const occupyModule = (moduleId, operatorId, operatorName) =>
  setDoc(moduleRef(moduleId), {
    activeOperatorId: operatorId,
    activeOperatorName: operatorName,
    status: 'occupied',
    lastUpdated: new Date().toISOString(),
  }, { merge: true });

export const freeModule = (moduleId) =>
  setDoc(moduleRef(moduleId), {
    activeOperatorId: null,
    activeOperatorName: null,
    status: 'available',
    lastUpdated: new Date().toISOString(),
  }, { merge: true });

// Libera los módulos ocupados cuyo operador cumpla `match` (por defecto, todos los ocupados).
// Lee cada módulo en Firestore, así no depende de que la vista ya tenga su estado cargado.
const freeOccupiedModules = (match = () => true) =>
  Promise.all(FIXED_MODULES.map(async (mod) => {
    const snap = await getDoc(moduleRef(mod.id));
    const operatorId = snap.exists() ? snap.data().activeOperatorId : null;
    if (operatorId && match(operatorId)) await freeModule(mod.id);
  }));

// Libera los módulos que ocupa un operador (se identifica por RUT o, en datos antiguos, por uid).
export const freeModulesOf = (operatorKeys) => {
  const keys = operatorKeys.filter(Boolean);
  return keys.length ? freeOccupiedModules((id) => keys.includes(id)) : Promise.resolve();
};

// Libera todos los módulos ocupados (cierre del sistema, manual o por horario).
export const freeAllModules = () => freeOccupiedModules();

// Suscribe a varios módulos; callback recibe (moduleId, data).
export const subscribeModules = (modules, callback) => {
  const unsubs = modules.map((mod) =>
    onSnapshot(moduleRef(mod.id), (snap) => {
      if (snap.exists()) callback(mod.id, snap.data());
    })
  );
  return () => unsubs.forEach((u) => u());
};
