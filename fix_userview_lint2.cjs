const fs = require('fs');
const path = './src/components/UserView.jsx';
let content = fs.readFileSync(path, 'utf8');

// Revert previous change
content = content.replace(/const playNext = useCallback\(\(\) => \{/g, "const playNext = () => {");
content = content.replace(/      \}\n    \}\n  \}, \[audioQueue, isPlaying, audioEnabled, audioLanguage\]\);\n/g, "      }\n    }\n  };\n");

// Add eslint disable
content = content.replace(/  useEffect\(\(\) => \{\n    if \(audioQueue\.length > 0 && !isPlaying\) \{\n      playNext\(\);\n    \}\n  \}, \[audioQueue, isPlaying\]\);/g, "  useEffect(() => {\n    if (audioQueue.length > 0 && !isPlaying) {\n      playNext();\n    }\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [audioQueue, isPlaying]);");

fs.writeFileSync(path, content, 'utf8');
