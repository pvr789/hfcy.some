const fs = require('fs');
const path = './src/components/SuperAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// The onChange in SuperAdmin currently:
// onChange={(e) => {
//   let val = parseInt(e.target.value, 10);
//   if (isNaN(val)) val = '';
//   if (val > 99) val = 99;
//   if (val < 0) val = 0;
//   setManualTurn({ ...manualTurn, number: val });
// }} 

const regex = /onChange=\{\(e\) => \{\s*let val = parseInt[\s\S]*?\}\} /;
content = content.replace(regex, `onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9]/g, '');
                              if (val.length > 2) val = val.slice(0, 2);
                              setManualTurn({ ...manualTurn, number: val });
                            }} `);

// And the handleSetTurn logic:
content = content.replace(
  /if \(isNaN\(num\)\) return;/,
  `if (isNaN(num) || num < 1 || num > 99) {
      alert("Por favor ingresa un número de turno válido entre 1 y 99.");
      return;
    }`
);

fs.writeFileSync(path, content, 'utf8');
