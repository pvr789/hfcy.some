const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Inside App.jsx, we have a useEffect for checking autoCloseTime:
// We need to change it so it also sets isOpen: false

// First, we need access to the current isOpen state to avoid infinite writes.
// Since DashboardRouter doesn't have isOpen state directly, we can read it from the snapshot!
// In the system/status snapshot:

const snapRegex = /if \(docSnap\.exists\(\)\) \{\s*const data = docSnap\.data\(\);\s*setAutoCloseTime\(data\.autoCloseTime \|\| ''\);\s*if \(data\.isOpen === false\) \{/g;
const snapReplace = `if (docSnap.exists()) {
                const data = docSnap.data();
                setAutoCloseTime(data.autoCloseTime || '');
                // Also track isOpen globally to know if we need to close it
                window.__systemIsOpen = data.isOpen !== false;
                
                if (data.isOpen === false) {`;
content = content.replace(snapRegex, snapReplace);

// Now in the check interval:
const intervalRegex = /const check = \(\) => \{\s*if \(autoCloseTime && isPastCloseTime\(autoCloseTime\)\) \{\s*signOut\(auth\);\s*alert\("El sistema se encuentra fuera del horario de atención\."\);\s*\}\s*\};\s*check\(\);\s*const interval = setInterval\(check, 15000\);/g;
const intervalReplace = `const check = async () => {
      if (autoCloseTime && isPastCloseTime(autoCloseTime)) {
        // If system is still open in DB, close it!
        if (window.__systemIsOpen) {
          try {
            await setDoc(doc(db, 'system', 'status'), { isOpen: false }, { merge: true });
          } catch(e) {
            console.error("Error closing system automatically", e);
          }
        }
        signOut(auth);
        alert("El sistema se encuentra fuera del horario de atención.");
      }
    };
    check();
    const interval = setInterval(check, 15000);`;
content = content.replace(intervalRegex, intervalReplace);


fs.writeFileSync(path, content, 'utf8');
