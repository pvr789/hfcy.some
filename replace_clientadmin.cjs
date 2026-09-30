const fs = require('fs');

const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// We will inject the liveTime and liveDate state into ClientAdmin.jsx
if (!content.includes('const [liveTime')) {
  content = content.replace('const [operator, setOperator] = useState(null);', `const [operator, setOperator] = useState(null);\n  const [liveTime, setLiveTime] = useState('');\n  const [liveDate, setLiveDate] = useState('');\n  useEffect(() => {\n    const updateTime = () => {\n      const now = new Date();\n      setLiveTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }));\n      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];\n      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];\n      setLiveDate(\`\${days[now.getDay()]}, \${now.getDate()} de \${months[now.getMonth()]}\`);\n    };\n    updateTime();\n    const intId = setInterval(updateTime, 1000);\n    return () => clearInterval(intId);\n  }, []);`);
}

// Replace the return blocks: Error, Module Selection, and Main Module.
// Finding the error return block:
content = content.replace(/if \(!operator\) \{\s*return \([\s\S]*?\);\s*\}/, `if (!operator) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-[1720px] mx-auto w-full px-8 h-20 flex items-center justify-between">
            <h2 className="text-xl font-black text-red-600">Error de Acceso</h2>
            <button onClick={onLogout} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-2">
              <LogOut size={18} /> Salir
            </button>
          </div>
        </header>
        <div className="p-10 text-center">No se encontró tu perfil de usuario. Contacta al administrador.</div>
      </div>
    );
  }`);

// Finding the Module selection return block:
// It looks like: if (!selectedModule) { ... }
const moduleSelectionReplacement = `if (!selectedModule) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-[1720px] mx-auto w-full px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-white font-black text-xl leading-none">H</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-base font-black text-slate-900 leading-tight tracking-tight">HOSPITAL DE YUMBEL</h1>
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Sistema de Atención</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-800">{operator.name}</span>
                  <span className="text-xs font-bold text-slate-400">OPERADOR</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
              </div>

              <div className="h-7 w-px bg-slate-200"></div>
              <button onClick={handleLogoutAction} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-2">
                <LogOut size={18} /> Salir
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-[1720px] mx-auto w-full px-8 py-10 flex-1 flex flex-col items-center">
          <LayoutGrid size={48} className="text-slate-300 mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-8">¿En qué módulo atenderás hoy?</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
            {FIXED_MODULES.map(mod => {
              const status = modulesStatus[mod.id];
              const operatorRut = operator.rut || operator.id || auth.currentUser.uid;
              const myOccupiedModule = FIXED_MODULES.find(m => modulesStatus[m.id]?.activeOperatorId === operatorRut);
              const isOccupiedByMe = status && status.activeOperatorId === operatorRut;
              const isOccupiedByOther = status && status.activeOperatorId && !isOccupiedByMe;
              
              let isDisabled = false;
              let statusText = 'Disponible';
              let isGhost = false;

              if (myOccupiedModule) {
                if (isOccupiedByMe) {
                  statusText = 'Tu Módulo Actual';
                } else {
                  isDisabled = true;
                  isGhost = true;
                  statusText = isOccupiedByOther ? \`Ocupado por \${status.activeOperatorName}\` : 'Debes salir de tu módulo actual';
                }
              } else {
                if (isOccupiedByOther) {
                  isDisabled = true;
                  isGhost = true;
                  statusText = \`Ocupado por \${status.activeOperatorName}\`;
                }
              }

              return (
                <button 
                  key={mod.id} 
                  onClick={() => !isDisabled && handleSelectModule(mod)}
                  disabled={isDisabled}
                  className={\`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all \${isGhost ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-blue-100 bg-white hover:border-blue-500 hover:shadow-md cursor-pointer'}\`}
                >
                  <span className={\`text-4xl font-black mb-2 \${isGhost ? 'text-slate-300' : 'text-blue-600'}\`}>{mod.letter}</span>
                  <span className={\`text-sm font-bold \${isGhost ? 'text-slate-400' : 'text-slate-700'}\`}>{mod.name}</span>
                  <span className={\`text-xs font-semibold mt-2 px-2 py-1 rounded-full \${isOccupiedByMe ? 'bg-emerald-100 text-emerald-700' : isGhost ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-600'}\`}>{statusText}</span>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }`;

content = content.replace(/if \(!selectedModule\) \{\s*return \([\s\S]*?\);\s*\}/, moduleSelectionReplacement);

fs.writeFileSync(path, content, 'utf8');
