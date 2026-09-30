const fs = require('fs');

// Fix Jefatura (LoginSuper.jsx)
let superPath = './src/components/LoginSuper.jsx';
let superContent = fs.readFileSync(superPath, 'utf8');
superContent = superContent.replace(/<h2>Bienvenido\/a<\/h2>/, '<h2>Hola, bienvenido a la Plataforma de Administración</h2>');
superContent = superContent.replace(/<p className="login-subtitle">Ingresa tus credenciales para acceder\.<\/p>/, '<p className="login-subtitle">Ingresa tus credenciales para acceder.</p>'); // Ensure subtitle is correct
fs.writeFileSync(superPath, superContent, 'utf8');

// Fix Operadores (Login.jsx)
let opPath = './src/components/Login.jsx';
let opContent = fs.readFileSync(opPath, 'utf8');
opContent = opContent.replace(/<h2>Bienvenido\/a<\/h2>/, '<h2>Hola, bienvenido a la Plataforma de Atención</h2>');
fs.writeFileSync(opPath, opContent, 'utf8');

