const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure updateDoc is imported
if (!content.includes('updateDoc')) {
  content = content.replace(/import \{ doc, getDoc, setDoc, onSnapshot \} from 'firebase\/firestore';/, "import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';");
}

const target = /await setDoc\(doc\(db, 'system', 'status'\), \{ isOpen: false \}, \{ merge: true \}\);/;
const replaceWith = `await setDoc(doc(db, 'system', 'status'), { isOpen: false }, { merge: true });
            // Free all modules to ensure system closes correctly
            for (let i = 1; i <= 14; i++) {
              try {
                await updateDoc(doc(db, \`system/modules_\${i}\`), {
                  activeOperatorId: null,
                  activeOperatorName: null,
                  status: 'available',
                  lastUpdated: new Date().toISOString()
                });
              } catch(err) {}
            }`;

content = content.replace(target, replaceWith);

fs.writeFileSync(path, content, 'utf8');
