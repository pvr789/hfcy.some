const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/ \/\/[\s]*\}, 15000\); \/\/ Revisa cada 15 segundos/, '');

fs.writeFileSync(path, content, 'utf8');
