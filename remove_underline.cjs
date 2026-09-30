const fs = require('fs');

const path = './src/components/Home.jsx';
let content = fs.readFileSync(path, 'utf8');

// The <Link> elements have `className="..."`. We can just add `style={{ textDecoration: 'none' }}`
content = content.replace(/<Link to="\/loginS" className="/g, '<Link to="/loginS" style={{ textDecoration: "none" }} className="');
content = content.replace(/<Link to="\/login" className="/g, '<Link to="/login" style={{ textDecoration: "none" }} className="');
content = content.replace(/<Link to="\/visor" className="/g, '<Link to="/visor" style={{ textDecoration: "none" }} className="');

fs.writeFileSync(path, content, 'utf8');
