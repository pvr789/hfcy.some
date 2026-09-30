const fs = require('fs');
const path = './src/components/SuperAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/catch \(loginErr\) \{\n          setError\("Contraseña incorrecta para confirmar la eliminación\."\);\n/g, "catch (loginErr) {\n          console.error(loginErr);\n          setError(\"Contraseña incorrecta para confirmar la eliminación.\");\n");

fs.writeFileSync(path, content, 'utf8');
