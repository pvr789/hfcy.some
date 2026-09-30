const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /if \(userRole === 'superuser'\) return;\s*const check = async \(\) => \{\s*if \(autoCloseTime && isPastCloseTime\(autoCloseTime\)\) \{\s*\/\/ If system is still open in DB, close it!\s*if \(window\.__systemIsOpen\) \{\s*try \{\s*await setDoc\(doc\(db, 'system', 'status'\), \{ isOpen: false \}, \{ merge: true \}\);\s*\} catch\(e\) \{\s*console\.error\("Error closing system automatically", e\);\s*\}\s*\}\s*signOut\(auth\);\s*alert\("El sistema se encuentra fuera del horario de atención\."\);\s*\}\s*\};/g;

const replaceWith = `
    const check = async () => {
      if (autoCloseTime && isPastCloseTime(autoCloseTime)) {
        // If system is still open in DB, close it!
        if (window.__systemIsOpen) {
          try {
            await setDoc(doc(db, 'system', 'status'), { isOpen: false }, { merge: true });
          } catch(e) {
            console.error("Error closing system automatically", e);
          }
        }
        if (userRole !== 'superuser') {
          signOut(auth);
          alert("El sistema se encuentra fuera del horario de atención.");
        }
      }
    };`;

content = content.replace(regex, replaceWith);

fs.writeFileSync(path, content, 'utf8');
