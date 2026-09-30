const fs = require('fs');

function replaceAll(path) {
  let content = fs.readFileSync(path, 'utf8');
  // First, we know my regex changed catch(err) to catch(e) and catch(loginErr) etc.
  // And I replaced console.error(loginErr) with empty.
  // The easiest is just replace all console.error(err) with console.error(e) or console.error(loginErr) depending on the context.
  // Actually, I can just change all catch(loginErr) to catch(loginErr) { console.error(loginErr); ... }
  // Let's just fix the variables.
  
  // In SuperAdmin.jsx: all missing 'err' were originally 'loginErr' or 'e'.
  // If we see `err`, it means my script added it.
  content = content.replace(/console\.error\(err\)/g, "console.error(e)");
  content = content.replace(/catch \(loginErr\) \{/g, "catch (e) {");
  
  fs.writeFileSync(path, content, 'utf8');
}

replaceAll('./src/components/ClientAdmin.jsx');
replaceAll('./src/components/SuperAdmin.jsx');

// Also for ClientAdmin.jsx, let's fix runTransaction import properly
let caContent = fs.readFileSync('./src/components/ClientAdmin.jsx', 'utf8');
if (!caContent.includes('runTransaction')) {
  caContent = caContent.replace(/import \{ doc, getDoc, updateDoc, setDoc, onSnapshot \} from 'firebase\/firestore';/, "import { doc, getDoc, updateDoc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';");
}
fs.writeFileSync('./src/components/ClientAdmin.jsx', caContent, 'utf8');
