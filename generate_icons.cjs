const sharp = require('sharp');
const path = require('path');

const svgFile = path.join(__dirname, 'public', 'logo-hospital.svg');

async function createIcon(size, outputName, transparent = true) {
  try {
    let s = sharp(svgFile).resize(size, size);
    
    if (!transparent) {
      s = s.flatten({ background: { r: 255, g: 255, b: 255 } });
    }
    
    await s.png().toFile(path.join(__dirname, 'public', outputName));
    console.log(`Creado ${outputName}`);
  } catch (err) {
    console.error(`Error creando ${outputName}:`, err);
  }
}

async function run() {
  // Íconos PWA principales con fondo TRANSPARENTE
  await createIcon(192, 'pwa-192x192.png', true);
  await createIcon(512, 'pwa-512x512.png', true);
  
  // Apple no soporta transparencias, debe tener fondo BLANCO
  await createIcon(180, 'apple-touch-icon.png', false);
}

run();
