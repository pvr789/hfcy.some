const fs = require('fs');

const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update the "Fijar Turno" button class
content = content.replace(
  /className="w-full bg-\[#f1f5f9\] hover:bg-slate-200 text-slate-700 font-bold text-xs py-3\.5 px-4 rounded-xl transition duration-150 active:scale-\[0\.99\] text-center"/g,
  'className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition duration-150 active:scale-[0.99] text-center shadow-sm"'
);

// EN SALA turn text
content = content.replace(
  /className="text-2xl font-black text-blue-600 tracking-wider"/g,
  'className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wider"'
);

fs.writeFileSync(path, content, 'utf8');
