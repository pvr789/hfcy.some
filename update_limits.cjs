const fs = require('fs');

function applyLimits(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  // Update onChange for the input
  content = content.replace(
    /onChange=\{\(e\) => setManualTurn\(\{ \.\.\.manualTurn, number: e\.target\.value \}\)\}/,
    `onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9]/g, '');
                              if (val.length > 2) val = val.slice(0, 2);
                              setManualTurn({ ...manualTurn, number: val });
                            }}`
  );

  // Update handleSetTurn logic
  // The line is: if (isNaN(num)) return;
  content = content.replace(
    /if \(isNaN\(num\)\) return;/,
    `if (isNaN(num) || num < 1 || num > 99) {
      alert("Por favor ingresa un número de turno válido entre 1 y 99.");
      return;
    }`
  );

  fs.writeFileSync(path, content, 'utf8');
}

applyLimits('./src/components/ClientAdmin.jsx');
applyLimits('./src/components/SuperAdmin.jsx');
