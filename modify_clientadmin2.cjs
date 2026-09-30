const fs = require('fs');
const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('<div className="switches-container mt-2"');
const pipIndex = content.indexOf('{!pipWindow && (\'documentPictureInPicture\' in window)');

if (startIndex > -1 && pipIndex > -1) {
  const extractedSwitches = content.substring(startIndex, pipIndex);
  
  // Remove it from controlsContent
  content = content.replace(extractedSwitches, '');

  const globalControlsBlock = `
      {!pipWindow && (
        <div className="admin-card glass scale-in mt-4">
          <h3 style={{marginBottom: 15, fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10}}>Configuración Global</h3>
          
          <div style={{marginBottom: '1.5rem'}}>
            <p style={{fontSize: '0.9rem', marginBottom: '10px', opacity: 0.8}}><strong>Fijar próximo turno global</strong><br/>(El número que escribas será el próximo en aparecer en pantalla cuando presiones avanzar).</p>
            <div style={{display: 'flex', gap: '10px', alignItems: 'stretch'}}>
              <div style={{display: 'flex', flex: 1, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', overflow: 'hidden'}}>
                <select 
                  value={manualTurn.letter} 
                  onChange={(e) => setManualTurn({...manualTurn, letter: e.target.value})}
                  style={{background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '10px', outline: 'none', borderRight: '1px solid rgba(255,255,255,0.2)'}}
                >
                  {['A','B','C','D','E'].map(l => <option key={l} value={l} style={{color:'#000'}}>{l}</option>)}
                </select>
                <input 
                  type="number" 
                  min="1"
                  placeholder="Ej. 1"
                  value={manualTurn.number}
                  onChange={(e) => setManualTurn({...manualTurn, number: e.target.value})}
                  style={{background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '10px', outline: 'none', width: '100%'}}
                />
              </div>
              <button 
                onClick={handleSetTurn}
                className="btn primary"
                disabled={!manualTurn.number}
                style={{margin: 0, padding: '0 20px'}}
              >
                Fijar
              </button>
            </div>
          </div>

          <div style={{borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 15}}></div>

          ${extractedSwitches}
        </div>
      )}
  `;

  // We need to inject globalControlsBlock right after controlsContent is rendered.
  // The render block is:
  // ) : (
  //   controlsContent
  // )}
  
  content = content.replace(
    ') : (\n            controlsContent\n          )}',
    `) : (\n            <>\n              {controlsContent}\n              ${globalControlsBlock}\n            </>\n          )}`
  );

  fs.writeFileSync(path, content, 'utf8');
  console.log("SUCCESS");
} else {
  console.log("FAILED to find indices", startIndex, pipIndex);
}
