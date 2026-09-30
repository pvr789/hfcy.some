const fs = require('fs');

const path = './src/components/LoginSuper.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\s*\/\/ Auto-creación de seguridad si alguien borra el usuario admin por accidente en la base de datos\n\s*if \(email\.trim\(\) === '17471333-2@some\.cl' \|\| email\.trim\(\) === '17709338K@some\.cl'\) \{\n\s*try \{\n\s*const \{ createUserWithEmailAndPassword \} = await import\('firebase\/auth'\);\n\s*await createUserWithEmailAndPassword\(auth, email\.trim\(\), password\);\n\s*navigate\('\/dashboard'\);\n\s*return;\n\s*\} catch \(createErr\) \{\n\s*console\.error\("Auto-registration failed:", createErr\);\n\s*\}\n\s*\}/g;

content = content.replace(regex, '');

fs.writeFileSync(path, content, 'utf8');
