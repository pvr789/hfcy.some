const fs = require('fs');
const path = require('path');

const srcPath = './src/components/ClientAdmin.jsx';
const destFolder = '/Users/patrik/Antigravity/Vistas_Stitch/3_Modo_Compacto';
const destPath = path.join(destFolder, 'VentanaFlotante_Puro.html');

if (!fs.existsSync(destFolder)){
    fs.mkdirSync(destFolder, { recursive: true });
}

let content = fs.readFileSync(srcPath, 'utf8');

// Extraer block
const match = content.match(/const controlsContent = \([\s\S]*?<\/div>\s*\);/);
if (!match) {
  console.log("No se pudo extraer controlsContent");
  process.exit(1);
}

let html = match[0];

// Remove const controlsContent = ( and );
html = html.replace(/const controlsContent = \(\s*/, '').replace(/\s*\);$/, '');

// Set min-h-screen instead of ternary
html = html.replace(/`bg-white \$\{pipWindow \? 'min-h-screen p-6' : '[^']+'\} flex flex-col`/, '"bg-white min-h-screen p-6 flex flex-col"');

// Clean React attributes
html = html.replace(/className=/g, 'class=');
html = html.replace(/onClick=\{[^}]+\}/g, '');
html = html.replace(/disabled=\{[^}]+\}/g, '');

// Mock data
html = html.replace(/\{selectedModule\.name\.toUpperCase\(\)\}/g, 'MÓDULO X');
html = html.replace(/\{operator\.name\}/g, 'Nombre Operador');
html = html.replace(/\{moduleState\.letter\}/g, 'A');
html = html.replace(/\{Math\.max\(0, moduleState\.number\)\.toString\(\)\.padStart\(2, '0'\)\}/g, '05');
html = html.replace(/\{globalQueue\.globalTurnLetter \|\| 'A'\}/g, 'A');
html = html.replace(/\{\(globalQueue\.globalTurnNumber !== undefined \? globalQueue\.globalTurnNumber : 0\)\.toString\(\)\.padStart\(2, '0'\)\}/g, '12');

// Mock Icons
html = html.replace(/<ArrowRight size=\{24\} \/>/g, '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>');
html = html.replace(/<Repeat size=\{20\} \/>/g, '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>');

// Mock dynamic text logic
html = html.replace(/\{isCoolingDown \? 'Reproduciendo\.\.\.' : 'Repetir Llamado'\}/g, 'Repetir Llamado');

const finalHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=320, initial-scale=1.0">
    <title>Modo Compacto - Diseño</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        margin: 0;
        background-color: #f8fafc;
        width: 320px;
        height: 480px;
        border: 1px solid #e2e8f0;
      }
    </style>
</head>
<body class="antialiased text-slate-800">
${html}
</body>
</html>`;

fs.writeFileSync(destPath, finalHtml, 'utf8');
console.log("HTML exportado correctamente");
