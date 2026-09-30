const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const interval = setInterval\(\(\) => \{/,
  `const check = () => {\n      if (autoCloseTime && isPastCloseTime(autoCloseTime)) {\n        signOut(auth);\n        alert("El sistema se encuentra fuera del horario de atención.");\n      }\n    };\n    check();\n    const interval = setInterval(check, 15000); // Revisa cada 15 segundos\n    //`
);
// Remove the old block inside setInterval
content = content.replace(/if \(autoCloseTime && isPastCloseTime\(autoCloseTime\)\) \{\s*signOut\(auth\);\s*alert\("El sistema ha alcanzado el horario de cierre automático\."\);\s*\}/, '');

fs.writeFileSync(path, content, 'utf8');
