const fs = require('fs');

let content;

// ClientAdmin.jsx
content = fs.readFileSync('./src/components/ClientAdmin.jsx', 'utf8');
content = content.replace(/catch \(e\) \{\n          console\.error\('Error actualizando estado:', e\);\n/g, "catch (err) {\n          console.error('Error actualizando estado:', err);\n");
fs.writeFileSync('./src/components/ClientAdmin.jsx', content, 'utf8');

// SuperAdmin.jsx
content = fs.readFileSync('./src/components/SuperAdmin.jsx', 'utf8');
content = content.replace(/catch \(loginErr\) \{\n          console\.error\(loginErr\);\n/g, "catch (err) {\n          console.error(err);\n");
fs.writeFileSync('./src/components/SuperAdmin.jsx', content, 'utf8');

// UserView.jsx
content = fs.readFileSync('./src/components/UserView.jsx', 'utf8');
content = content.replace(/import \{ useState, useEffect, useRef, useCallback \} from 'react';/, "import { useState, useEffect, useRef } from 'react';");
fs.writeFileSync('./src/components/UserView.jsx', content, 'utf8');

