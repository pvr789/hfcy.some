const fs = require('fs');
const path = './src/components/SuperAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// The function is handleFixTurn
// Let's find it.
// It starts with: const handleFixTurn = async () => {
// Then: const num = parseInt(manualTurn.number, 10);
// Then: if (isNaN(num)) return;

content = content.replace(
  /const num = parseInt\(manualTurn\.number, 10\);\s*if \(isNaN\(num\)\) return;/,
  `const num = parseInt(manualTurn.number, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      alert("Por favor ingresa un número de turno válido entre 1 y 99.");
      return;
    }`
);

fs.writeFileSync(path, content, 'utf8');
