const fs = require('fs');

const path = './src/components/SuperAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. We need to read autoCloseTime from system/status.
// In SuperAdmin.jsx, we already listen to system/status. We have `isSystemOpen`. Let's add `autoCloseTime` state.
content = content.replace(/const \[isSystemOpen, setIsSystemOpen\] = useState\(false\);/, "const [isSystemOpen, setIsSystemOpen] = useState(false);\n  const [autoCloseTime, setAutoCloseTime] = useState('');\n  const [savingAutoClose, setSavingAutoClose] = useState(false);");

// 2. In the snapshot for system/status:
content = content.replace(/setIsSystemOpen\(docSnap\.data\(\)\.isOpen !== false\);/, "setIsSystemOpen(docSnap.data().isOpen !== false);\n        setAutoCloseTime(docSnap.data().autoCloseTime || '');");

// 3. Add handleSaveAutoClose function
const handleSaveAutoClose = `
  const handleSaveAutoClose = async (time) => {
    setSavingAutoClose(true);
    try {
      await setDoc(doc(db, 'system', 'status'), { autoCloseTime: time }, { merge: true });
    } catch(e) {
      console.error(e);
      setError('Error al guardar horario de cierre');
    } finally {
      setSavingAutoClose(false);
    }
  };
`;
content = content.replace(/const handleToggleSystemStatus = async \(\) => \{/, handleSaveAutoClose + "\n  const handleToggleSystemStatus = async () => {");

// 4. Add UI to the Monitor card
const monitorHeader = `<div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <h3 className="font-bold text-slate-900 text-base">Monitor</h3>
                  </div>
                </div>`;

const monitorHeaderReplacement = `<div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <h3 className="font-bold text-slate-900 text-base">Monitor</h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cierre Auto:</label>
                    <input 
                      type="time" 
                      value={autoCloseTime} 
                      onChange={(e) => handleSaveAutoClose(e.target.value)}
                      disabled={savingAutoClose}
                      className="text-xs bg-transparent font-bold text-slate-700 border-none p-0 focus:ring-0 cursor-pointer"
                      title="Hora de cierre automático (ej. 17:30)"
                    />
                    {autoCloseTime && (
                      <button onClick={() => handleSaveAutoClose('')} className="text-red-400 hover:text-red-600 ml-1" title="Quitar horario">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    )}
                  </div>
                </div>`;

content = content.replace(monitorHeader, monitorHeaderReplacement);

fs.writeFileSync(path, content, 'utf8');
