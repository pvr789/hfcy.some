const fs = require('fs');

['./src/components/Login.jsx', './src/components/LoginSuper.jsx'].forEach(path => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/className="login-form glass fade-in"/, 'className="login-form fade-in"');
  fs.writeFileSync(path, content, 'utf8');
});
