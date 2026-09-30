const fs = require('fs');
let content = fs.readFileSync('./src/components/UserView.jsx', 'utf8');

// Replace the initTimestampRef and useEffect
const oldEffect = /const initTimestampRef = useRef\(new Date\(\)\.getTime\(\)\);\n[\s\S]*?\/\/ 1\. Cargar Configuración Global/;

const newEffect = `// 1. Cargar Configuración Global`;

content = content.replace(oldEffect, newEffect);

const oldListener = /\/\/ 2\. Escuchar nuevos llamados en Historial \(para la cola\)[\s\S]*?return \(\) => unsub\(\);\n  \}, \[\]\);/;

const newListener = `// 2. Escuchar nuevos llamados en Historial (para la cola)
  const isFirstRun = useRef(true);
  
  useEffect(() => {
    const q = query(collection(db, "system/calls/history"), orderBy("timestamp", "desc"), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      if (isFirstRun.current) {
        // Carga inicial: poblar historial directamente sin reproducir sonido
        const initialDocs = [];
        snap.forEach(doc => initialDocs.push(doc.data()));
        setHistory(initialDocs.slice(0, 5));
        isFirstRun.current = false;
        return;
      }
      
      // Llamados nuevos que entran después de la carga:
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          setQueue(prev => [...prev, data]);
        }
      });
    });
    return () => unsub();
  }, []);`;

content = content.replace(oldListener, newListener);

fs.writeFileSync('./src/components/UserView.jsx', content, 'utf8');
