const fs = require('fs');
const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix runTransaction missing import
content = content.replace(/import \{ doc, getDoc, updateDoc, setDoc, onSnapshot \} from 'firebase\/firestore';/, "import { doc, getDoc, updateDoc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';");

// Remove successMessage
content = content.replace(/  const \[successMessage, setSuccessMessage\] = useState\(''\);\n/, '');

// Remove unused 'e'
content = content.replace(/catch \(e\) \{\n          console\.error\('Error actualizando estado:'\);\n/g, "catch (e) {\n          console.error('Error actualizando estado:', e);\n");

fs.writeFileSync(path, content, 'utf8');
