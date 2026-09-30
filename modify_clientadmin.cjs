const fs = require('fs');
const path = './src/components/ClientAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state for manualTurn
if (!content.includes('const [manualTurn, setManualTurn]')) {
  content = content.replace(
    'const [moduleState, setModuleState] = useState({ letter: \'A\', number: 0, isPaused: false });',
    `const [moduleState, setModuleState] = useState({ letter: 'A', number: 0, isPaused: false });\n  const [manualTurn, setManualTurn] = useState({ letter: 'A', number: '' });`
  );
}

// 2. Add handleSetTurn function
const handleSetTurnCode = `
  const handleSetTurn = async () => {
    const num = parseInt(manualTurn.number, 10);
    if (isNaN(num)) return;

    if (!window.confirm(\`¿Estás seguro que deseas fijar el próximo turno global en \${manualTurn.letter}-\${num}?\`)) {
      return;
    }

    try {
      const turnRef = doc(db, \`system/config\`);
      await updateDoc(turnRef, {
        globalTurnLetter: manualTurn.letter,
        globalTurnNumber: num - 1
      });
      setManualTurn({ letter: manualTurn.letter, number: '' });
    } catch (err) {
      console.error(err);
    }
  };
`;

if (!content.includes('const handleSetTurn')) {
  content = content.replace('const toggleAudio = async () => {', handleSetTurnCode + '\n  const toggleAudio = async () => {');
}

// 3. Extract the switches-container from controlsContent
const switchesRegex = /<div className="switches-container mt-2" style={{flexDirection: 'column'}}>([\s\S]*?)<\/div>\s*<\/div>\s*<div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>\s*<label([\s\S]*?)<\/label>\s*<\/div>\s*<\/div>/;

// Wait, the regex needs to be very precise to not break JSX.
// Let's just find the start of switches-container and the end.
