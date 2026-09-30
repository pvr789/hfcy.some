const fs = require('fs');

const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

const superAdminHeaderBase = `<header className="bg-white border-b border-slate-200/80 px-8 py-3.5 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-6 flex-wrap xl:flex-nowrap">
          <div className="flex items-center gap-3.5">
            <img alt="Logo Hospital de Yumbel" className="w-11 h-11 rounded-full object-cover shadow-sm border border-slate-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnlb_Qek0e-k-UYeE3t5ZspyVUV1JKd7q2PrDfISINdEgDiEAQxBazBDTZ6DbFQJtfEbM1BKTFNAmCOGk6DHHa-xyqFVD_B8wfVLt6NkAjYw9fXfSTtvzp9XAeEecdGvKAsEaO5DBhWugyKPaZOSulylIuVy3v20xOgzxz-oGJe9LcDcX4OCWe4RQfGosf53mUP9xGTVx3bpqn-Svo5N4IxP4oRihjGMmBmAaQIwvYq-yoEh5PjPHju8XJW45ZSdSTJREWFSNN9KjjzPk" />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Hospital de Yumbel</h1>
              <p className="text-[11px] tracking-wider font-semibold text-slate-400 uppercase">Sistema de Atención y Espera</p>
            </div>
          </div>`;

// Replace Error Header
content = content.replace(/<header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">[\s\S]*?<\/header>/, 
`${superAdminHeaderBase}
          <div className="flex items-center gap-6">
            <button onClick={onLogout} className="text-xs font-bold text-slate-500 hover:text-red-500 transition px-2 py-1">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>`);

// Replace Module Select Header
content = content.replace(/<header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">[\s\S]*?<\/header>/, 
`${superAdminHeaderBase}
          <div className="flex items-center gap-6">
            <button onClick={handleLogoutAction} className="text-xs font-bold text-slate-500 hover:text-red-500 transition px-2 py-1">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>`);

// Replace Main Dashboard Header
content = content.replace(/<header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">[\s\S]*?<\/header>/, 
`${superAdminHeaderBase}
          <div className="flex items-center gap-6">
            <button onClick={handleLogoutAction} className="text-xs font-bold text-slate-500 hover:text-red-500 transition px-2 py-1">
              Cerrar Sesión
            </button>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-1.5 shadow-xs">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-700 tracking-tight leading-tight">{liveDate}</span>
              </div>
              <div className="h-7 w-px bg-slate-200"></div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-800 tracking-tight font-mono tabular-nums leading-none">{liveTime}</span>
                <span className="text-[11px] font-bold text-teal-700 tracking-wider">HRS</span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-1.5 shadow-xs">
              <span className="text-xs font-bold text-slate-700">{operator.name}</span>
              <div className="h-7 w-px bg-slate-200"></div>
              <span className="text-xs font-black text-blue-600">{selectedModule.name.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>`);

fs.writeFileSync(path, content, 'utf8');
