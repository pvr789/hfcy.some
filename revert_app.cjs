const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove isPastCloseTime function
content = content.replace(/function isPastCloseTime\(closeTimeStr\) \{[\s\S]*?return false;\n\}\n\n/, '');

// 2. Remove autoCloseTime state
content = content.replace(/  const \[autoCloseTime, setAutoCloseTime\] = useState\(''\);\n/, '');

// 3. Remove window.__systemIsOpen and setAutoCloseTime from snapshot
content = content.replace(/                setAutoCloseTime\(data\.autoCloseTime \|\| ''\);\n                \/\/ Also track isOpen globally to know if we need to close it\n                window\.__systemIsOpen = data\.isOpen !== false;\n/, '');

// 4. Remove the useEffect with setInterval(check, 15000)
const checkUseEffectRegex = /  useEffect\(\(\) => \{\s*const check = async \(\) => \{[\s\S]*?return \(\) => clearInterval\(interval\);\n  \}, \[autoCloseTime, userRole\]\);\n\n/g;
content = content.replace(checkUseEffectRegex, '');

fs.writeFileSync(path, content, 'utf8');
