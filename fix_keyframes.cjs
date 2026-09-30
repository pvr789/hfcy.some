const fs = require('fs');
const path = './src/index.css';
let content = fs.readFileSync(path, 'utf8');

// Replace the broken part
content = content.replace(/  70% \{ box-shadow: 0 0 0 6px rgba\(239, 68, 68, 0\); \}\n  100% \{ box-shadow: 0 0 0 0 rgba\(239, 68, 68, 0\); \}\n\}/, '');

fs.writeFileSync(path, content, 'utf8');
