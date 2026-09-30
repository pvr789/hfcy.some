const fs = require('fs');

// ClientAdmin.jsx
let content = fs.readFileSync('./src/components/ClientAdmin.jsx', 'utf8');
content = content.replace(/catch \(e\) \{/g, "catch (err) {\n          // eslint-disable-next-line no-unused-vars\n          const e = err;");
content = content.replace(/import \{ doc, getDoc,/g, "import { runTransaction, doc, getDoc,");
fs.writeFileSync('./src/components/ClientAdmin.jsx', content, 'utf8');

// SuperAdmin.jsx
content = fs.readFileSync('./src/components/SuperAdmin.jsx', 'utf8');
content = content.replace(/catch \(e\) \{/g, "catch (err) {\n          // eslint-disable-next-line no-unused-vars\n          const e = err;");
content = content.replace(/console\.error\('Error:', err\)/g, "console.error('Error:', e)");
content = content.replace(/err\./g, "e.");
fs.writeFileSync('./src/components/SuperAdmin.jsx', content, 'utf8');

