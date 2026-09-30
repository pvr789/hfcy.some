const fs = require('fs');

const path = './src/components/SuperAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// The line is: const [isSystemOpen, setIsSystemOpen] = useState(true);
content = content.replace(
  /const \[isSystemOpen, setIsSystemOpen\] = useState\(true\);/,
  "const [isSystemOpen, setIsSystemOpen] = useState(true);\n  const [autoCloseTime, setAutoCloseTime] = useState('');\n  const [savingAutoClose, setSavingAutoClose] = useState(false);"
);

fs.writeFileSync(path, content, 'utf8');
