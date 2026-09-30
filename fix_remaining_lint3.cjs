const fs = require('fs');
let content;

// ClientAdmin.jsx
content = fs.readFileSync('./src/components/ClientAdmin.jsx', 'utf8');
content = content.replace(/catch \(err\) \{/g, "catch (e) {");
content = content.replace(/import_runTransaction\(/g, "runTransaction(");
content = content.replace(/import \{ doc, getDoc, updateDoc, setDoc, onSnapshot \} from 'firebase\/firestore';/, "import { doc, getDoc, updateDoc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';");
content = content.replace(/console\.error\('Error actualizando estado:', e\);/g, "console.error('Error actualizando estado:');");
fs.writeFileSync('./src/components/ClientAdmin.jsx', content, 'utf8');

// SuperAdmin.jsx
content = fs.readFileSync('./src/components/SuperAdmin.jsx', 'utf8');
content = content.replace(/catch \(err\) \{/g, "catch (loginErr) {");
content = content.replace(/console\.error\(loginErr\);/g, "");
fs.writeFileSync('./src/components/SuperAdmin.jsx', content, 'utf8');

