const fs = require('fs');

const path = './src/components/LoginSuper.jsx';
let content = fs.readFileSync(path, 'utf8');

// Remove red border
content = content.replace(/style=\{\{ borderColor: 'rgba\\(255, 60, 60, 0\.2\\)' \}\}/, '');

// Change titles
content = content.replace(/<h2>Acceso Jefatura<\/h2>/, '<h2>Bienvenido/a</h2>');
content = content.replace(/<p className="login-subtitle">Panel de administración global del sistema<\/p>/, '<p className="login-subtitle">Ingresa tus credenciales para acceder.</p>');

// Change button style to black
content = content.replace(/style=\{\{ background: 'var\(--danger-color, #e74c3c\)' \}\}/, "style={{ background: '#0f172a' }}");

fs.writeFileSync(path, content, 'utf8');
