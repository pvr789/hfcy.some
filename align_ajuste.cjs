const fs = require('fs');

const superAdminPath = './src/components/SuperAdmin.jsx';
const clientAdminPath = './src/components/ClientAdmin.jsx';

let superContent = fs.readFileSync(superAdminPath, 'utf8');
let clientContent = fs.readFileSync(clientAdminPath, 'utf8');

// Extract the article tag from SuperAdmin
const match = superContent.match(/<article className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200\/70 flex flex-col justify-between">[\s\S]*?<\/article>/);

if (match) {
  let replacement = match[0];
  // Change handleFixTurn back to handleSetTurn for ClientAdmin
  replacement = replacement.replace(/onClick=\{handleFixTurn\}/g, 'onClick={handleSetTurn}');
  
  // Replace the article in ClientAdmin
  clientContent = clientContent.replace(/<article className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200\/70 flex flex-col justify-between">[\s\S]*?<\/article>/, replacement);
  
  fs.writeFileSync(clientAdminPath, clientContent, 'utf8');
  console.log("Replaced Ajuste Manual");
} else {
  console.log("Could not find article in SuperAdmin");
}
