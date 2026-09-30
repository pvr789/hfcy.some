const fs = require('fs');

const path = './src/components/Login.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace texts
content = content.replace(/<h2>Ingreso Operadores<\/h2>/, '<h2>Bienvenido/a</h2>');
content = content.replace(/<p className="login-subtitle">Ingresa con tu RUT para operar un módulo<\/p>/, '<p className="login-subtitle">Ingresa tu RUT y contraseña para acceder.</p>');

fs.writeFileSync(path, content, 'utf8');
