import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

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

// Suscribe a varios módulos; callback recibe (moduleId, data).
export const subscribeModules = (modules, callback) => {
  const unsubs = modules.map((mod) =>
    onSnapshot(moduleRef(mod.id), (snap) => {
      if (snap.exists()) callback(mod.id, snap.data());
    })
  );
  return () => unsubs.forEach((u) => u());
};
