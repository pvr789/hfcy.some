const fs = require('fs');

const path = './index.html';
let content = fs.readFileSync(path, 'utf8');

const fonts = `
    <!-- Google Fonts: Plus Jakarta Sans & Space Grotesk -->
    <link href="https://fonts.googleapis.com" rel="preconnect">
    <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <!-- Material Symbols Outlined -->
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
`;

if (!content.includes("Plus+Jakarta+Sans")) {
  content = content.replace(/<title>Lista-Sitcker26<\/title>/, `<title>Lista-Sitcker26</title>${fonts}`);
  fs.writeFileSync(path, content, 'utf8');
}
