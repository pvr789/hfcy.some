const fs = require('fs');
const path = './src/index.css';
let content = fs.readFileSync(path, 'utf8');

const classesToRemove = [
  '.turn-display-small',
  '.manual-adjust-grid input,\n.manual-adjust-grid select',
  '.manual-adjust-grid',
  '.switches-container',
  '.switch-item:hover',
  '.switch-item',
  '.switch-info',
  '.switch-control input:checked \\+ .slider:before',
  '.switch-control input:focus \\+ .slider',
  '.switch-control input:checked \\+ .slider',
  '.switch-control .slider:before',
  '.switch-control .slider',
  '.switch-control input',
  '.switch-control',
  '.badge',
  '@keyframes pulse-red',
  '.grid-layout',
  '.admin-header h2',
  '.admin-header',
  '.admin-content',
];

classesToRemove.forEach(cls => {
  // Simple regex to remove the class block if it doesn't have nested complex stuff
  const regex = new RegExp(cls.replace(/\\/g, '\\\\') + '\\s*\\{[^}]*\\}', 'g');
  content = content.replace(regex, '');
});

fs.writeFileSync(path, content, 'utf8');
