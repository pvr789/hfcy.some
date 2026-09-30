const fs = require('fs');
const path = './src/components/UserView.jsx';
let content = fs.readFileSync(path, 'utf8');

// Claude said: "Resolver la advertencia de ESLint react-hooks/exhaustive-deps (línea ~56, playNext) sin cambiar el comportamiento de la cola."
// Usually this is by putting playNext in a useCallback or just suppressing the warning if we don't want to restructure.
// Since Claude requested to suppress or solve it without changing behavior, adding it to deps is fine if playNext is stable, but playNext is a regular function inside the component.
// The easiest is just to wrap playNext in useCallback.

content = content.replace(/const playNext = \(\) => \{/g, "const playNext = useCallback(() => {");
content = content.replace(/      \}\n    \}\n  \};\n\n  useEffect\(\(\) => \{/g, "      }\n    }\n  }, [audioQueue, isPlaying, audioEnabled, audioLanguage]);\n\n  useEffect(() => {");

// Ensure useCallback is imported
if (!content.includes('useCallback')) {
  content = content.replace(/import \{ useState, useEffect, useRef \} from 'react';/, "import { useState, useEffect, useRef, useCallback } from 'react';");
}

fs.writeFileSync(path, content, 'utf8');
