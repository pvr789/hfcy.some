const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure useRef is imported
if (!content.includes('useRef')) {
  content = content.replace(/import \{ useEffect, useState \} from 'react';/, "import { useEffect, useState, useRef } from 'react';");
}

// Add userRoleRef
content = content.replace(/const \[userRole, setUserRole\] = useState\(null\);/, "const [userRole, setUserRole] = useState(null);\n  const userRoleRef = useRef(null);");

// Update userRoleRef when setUserRole is called
content = content.replace(/setUserRole\(role\);/g, "setUserRole(role);\n          userRoleRef.current = role;");

// Update navigate on logout
content = content.replace(
  /navigate\('\/login'\);\s*setLoading\(false\);/,
  `if (userRoleRef.current === 'superuser') {
          navigate('/loginS');
        } else {
          navigate('/');
        }
        setLoading(false);`
);

fs.writeFileSync(path, content, 'utf8');
