const fs = require('fs');
let content = fs.readFileSync('./src/components/ClientAdmin.jsx', 'utf8');

// Replace timestamp: new Date() with timestamp: Date.now() when inside addDoc(collection(db, 'system/calls/history') ...
content = content.replace(/timestamp: new Date\(\)/g, "timestamp: Date.now()");

fs.writeFileSync('./src/components/ClientAdmin.jsx', content, 'utf8');
