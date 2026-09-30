const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add auto close utility
const utilCode = `
function isPastCloseTime(closeTimeStr) {
  if (!closeTimeStr) return false;
  const [closeH, closeM] = closeTimeStr.split(':').map(Number);
  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  
  if (currentH > closeH) return true;
  if (currentH === closeH && currentM >= closeM) return true;
  return false;
}
`;
if (!content.includes('isPastCloseTime')) {
  content = content.replace(/const SUPER_ADMIN_EMAIL = /, utilCode + '\nconst SUPER_ADMIN_EMAIL = ');
}

// 2. Add local state to DashboardRouter to track autoCloseTime
content = content.replace(/const \[loading, setLoading\] = useState\(true\);/, "const [loading, setLoading] = useState(true);\n  const [autoCloseTime, setAutoCloseTime] = useState('');");

// 3. Inside system/status snapshot, update autoCloseTime
const snapReplace = `if (docSnap.exists()) {
                const data = docSnap.data();
                setAutoCloseTime(data.autoCloseTime || '');
                
                if (data.isOpen === false) {`;
content = content.replace(/if \(docSnap\.exists\(\)\) \{\s+const data = docSnap\.data\(\);\s+if \(data\.isOpen === false\) \{/, snapReplace);

// 4. Add useEffect interval
const intervalCode = `
  useEffect(() => {
    if (userRole === 'superuser') return;
    
    const interval = setInterval(() => {
      if (autoCloseTime && isPastCloseTime(autoCloseTime)) {
        signOut(auth);
        alert("El sistema ha alcanzado el horario de cierre automático.");
      }
    }, 15000); // Revisa cada 15 segundos
    
    return () => clearInterval(interval);
  }, [autoCloseTime, userRole]);
`;
if (!content.includes('setInterval')) {
  content = content.replace(/const handleLogout = \(\) => \{/, intervalCode + '\n  const handleLogout = () => {');
}

fs.writeFileSync(path, content, 'utf8');
