const fs = require('fs');

const path = './src/index.css';
let content = fs.readFileSync(path, 'utf8');

// Remove glass and glass-dark
content = content.replace(/\.glass \{[\s\S]*?\n\}\n/g, '');
content = content.replace(/\.glass-dark \{[\s\S]*?\n\}\n/g, '');
// Remove --glass-bg and --glass-border, --glass-glow variables from root if they exist
content = content.replace(/--glass-bg: .*?;\n/g, '');
content = content.replace(/--glass-border: .*?;\n/g, '');
content = content.replace(/--glass-glow: .*?;\n/g, '');

fs.writeFileSync(path, content, 'utf8');
