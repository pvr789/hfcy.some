const fs = require('fs');

const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\{globalTurn\.letter\}-\{globalTurn\.number\.toString\(\)\.padStart\(2, '0'\)\}/g,
  `{(globalQueue.globalTurnLetter || 'A')}-{(globalQueue.globalTurnNumber !== undefined ? globalQueue.globalTurnNumber : 0).toString().padStart(2, '0')}`
);

fs.writeFileSync(path, content, 'utf8');
