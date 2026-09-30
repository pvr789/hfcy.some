const fs = require('fs');

const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<main className="max-w-\[1720px\] mx-auto w-full px-8 py-10 flex-1 flex flex-col items-center">[\s\S]*?<\/main>/;

const newMain = `<main className="admin-dashboard fade-in" style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px'}}>
          <div className="admin-card glass" style={{maxWidth: 800, width: '100%', textAlign: 'center', padding: '40px 20px'}}>
            <LayoutGrid size={48} style={{opacity: 0.2, margin: '0 auto 20px auto'}} />
            <h2 style={{marginBottom: 30, color: '#334155', fontSize: '1.5rem', fontWeight: 900}}>¿En qué módulo atenderás hoy?</h2>
            
            <div style={{display: 'flex', gap: 15, flexWrap: 'wrap', justifyContent: 'center'}}>
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
                    isDisabled = false;
                    statusText = 'Tu Módulo Actual';
                    isGhost = false;
                  } else {
                    isDisabled = true;
                    statusText = isOccupiedByOther ? \`Ocupado por \${status.activeOperatorName}\` : 'Debes salir de tu módulo actual';
                    isGhost = true;
                  }
                } else {
                  if (isOccupiedByOther) {
                    isDisabled = true;
                    statusText = \`Ocupado por \${status.activeOperatorName}\`;
                    isGhost = true;
                  }
                }

                return (
                  <button 
                    key={mod.id} 
                    onClick={() => !isDisabled && handleSelectModule(mod)}
                    className={\`btn \${isGhost ? 'ghost' : 'primary push-btn active-press'}\`}
                    style={{
                      padding: '20px 40px', 
                      fontSize: '1.2rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      opacity: isDisabled ? 0.6 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      border: isOccupiedByMe ? '2px solid var(--accent-color)' : 'none',
                      minWidth: '180px'
                    }}
                    disabled={isDisabled}
                  >
                    <span style={{fontSize: '2rem', fontWeight: 'bold'}}>{mod.letter}</span>
                    <span style={{fontSize: '0.9rem', opacity: 0.9, marginTop: '4px'}}>{mod.name}</span>
                    <span style={{
                      fontSize: '0.75rem', 
                      marginTop: 10, 
                      background: isOccupiedByMe ? '#d1fae5' : 'rgba(0,0,0,0.05)', 
                      color: isOccupiedByMe ? '#047857' : 'inherit',
                      padding: '4px 10px', 
                      borderRadius: 12,
                      fontWeight: 'bold'
                    }}>{statusText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>`;

content = content.replace(regex, newMain);

fs.writeFileSync(path, content, 'utf8');
