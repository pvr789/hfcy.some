const fs = require('fs');

const path = './src/components/Home.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/className="group relative flex/g, 'className="no-underline group relative flex');

fs.writeFileSync(path, content, 'utf8');
