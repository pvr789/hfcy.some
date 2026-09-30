const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\/\/ Free all modules to ensure system closes correctly\s*for \(let i = 1; i <= 14; i\+\+\) \{\s*try \{\s*await updateDoc\(doc\(db, \`system\/modules_\$\{i\}\`\), \{\s*activeOperatorId: null,\s*activeOperatorName: null,\s*status: 'available',\s*lastUpdated: new Date\(\)\.toISOString\(\)\s*\}\);\s*\} catch\(err\) \{\}\s*\}/;

const replaceWith = `// Free the 5 modules to ensure system closes correctly
            const moduleIds = ['modulo_a', 'modulo_b', 'modulo_c', 'modulo_d', 'modulo_e'];
            for (const mId of moduleIds) {
              try {
                await updateDoc(doc(db, \`system/modules_\${mId}\`), {
                  activeOperatorId: null,
                  activeOperatorName: null,
                  status: 'available',
                  lastUpdated: new Date().toISOString()
                });
              } catch(err) {}
            }`;

content = content.replace(regex, replaceWith);
fs.writeFileSync(path, content, 'utf8');
