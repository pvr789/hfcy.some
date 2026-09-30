const fs = require('fs');
let content;

// ClientAdmin.jsx
content = fs.readFileSync('./src/components/ClientAdmin.jsx', 'utf8');
content = content.replace(/catch \(e\) \{/g, "catch (err) {");
content = content.replace(/runTransaction\(/g, "import_runTransaction("); // Wait, if runTransaction is missing import, we need to import it! I added it earlier but maybe the regex failed.
if (!content.includes('import_runTransaction')) {
    content = content.replace(/import \{ doc, getDoc, updateDoc, setDoc, onSnapshot \} from 'firebase\/firestore';/, "import { doc, getDoc, updateDoc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';");
}
fs.writeFileSync('./src/components/ClientAdmin.jsx', content, 'utf8');

// SuperAdmin.jsx
content = fs.readFileSync('./src/components/SuperAdmin.jsx', 'utf8');
content = content.replace(/catch \(loginErr\) \{/g, "catch (err) {");
fs.writeFileSync('./src/components/SuperAdmin.jsx', content, 'utf8');

