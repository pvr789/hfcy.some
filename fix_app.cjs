const fs = require('fs');

const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes("import Home from './components/Home';")) {
  content = content.replace(/import ClientAdmin from '\.\/components\/ClientAdmin';/, "import ClientAdmin from './components/ClientAdmin';\nimport Home from './components/Home';");
}

// Replace the inline root element
const oldRoot = /<Route path="\/" element=\{\s*<div className="viewer-container"[\s\S]*?<\/div>\s*\} \/>/;
content = content.replace(oldRoot, '<Route path="/" element={<Home />} />');

fs.writeFileSync(path, content, 'utf8');
