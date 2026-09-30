const fs = require('fs');
let content = fs.readFileSync('./src/components/ClientAdmin.jsx', 'utf8');

// The `addDoc` is inside `if (globalQueue.audioEnabled) {` for both `handleManualFix` and `advanceTurn`.
// We need to remove that `if (globalQueue.audioEnabled) {` condition but keep the block.

// For advanceTurn:
content = content.replace(/if \(globalQueue\.audioEnabled\) \{\n\s*await addDoc\(collection\(db, `system\/calls\/history`\), \{/g, "await addDoc(collection(db, `system/calls/history`), {");
content = content.replace(/          timestamp: Date\.now\(\),\n\s*\}\);\n\n\s*setIsCoolingDown\(true\);\n\s*setTimeout\(\(\) => setIsCoolingDown\(false\), 3000\);\n\s*\}/g, "          timestamp: Date.now(),\n        });\n\n        setIsCoolingDown(true);\n        setTimeout(() => setIsCoolingDown(false), 3000);");

// For handleManualFix (around line 210):
// Actually, let's just do a string replace for handleManualFix
const manualFixRegex = /if \(globalQueue\.audioEnabled\) \{\n\s*await addDoc\(collection\(db, 'system\/calls\/history'\), \{[\s\S]*?timestamp: Date\.now\(\),\n\s*\}\);\n\s*setIsCoolingDown\(true\);\n\s*setTimeout\(\(\) => setIsCoolingDown\(false\), 3000\);\n\s*\}/;

const manualFixReplacement = `await addDoc(collection(db, 'system/calls/history'), {
        letter: letter,
        number: number,
        moduleName: selectedModule.name,
        moduleId: selectedModule.id,
        timestamp: Date.now(),
      });
      setIsCoolingDown(true);
      setTimeout(() => setIsCoolingDown(false), 3000);`;

content = content.replace(manualFixRegex, manualFixReplacement);

fs.writeFileSync('./src/components/ClientAdmin.jsx', content, 'utf8');
