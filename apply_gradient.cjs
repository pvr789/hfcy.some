const fs = require('fs');

const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// Turn text in PiP / controls
content = content.replace(
  /<div className="flex items-center text-5xl font-black text-blue-600">/g,
  '<div className="flex items-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">'
);

// Siguiente Turno Button
content = content.replace(
  /className="bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 px-6 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-3"/g,
  'className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-lg py-4 px-6 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-3"'
);

// Abrir Modo Compacto Button
content = content.replace(
  /className="mt-4 bg-slate-800 hover:bg-slate-900 text-white font-black py-5 px-6 rounded-3xl transition shadow-md flex items-center justify-center gap-3 w-full border border-slate-700 text-lg uppercase tracking-wide"/g,
  'className="mt-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-black py-5 px-6 rounded-3xl transition shadow-md flex items-center justify-center gap-3 w-full border border-slate-700 text-lg uppercase tracking-wide"'
);

// Regresar Controles Button
content = content.replace(
  /className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-sm"/g,
  'className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-sm"'
);

// PictureInPicture Icon
content = content.replace(
  /<PictureInPicture size=\{48\} className="text-blue-500 mb-6" \/>/g,
  '<PictureInPicture size={48} className="text-purple-500 mb-6" />'
);
content = content.replace(
  /<PictureInPicture size=\{24\} className="text-blue-400" \/>/g,
  '<PictureInPicture size={24} className="text-purple-400" />'
);

fs.writeFileSync(path, content, 'utf8');
