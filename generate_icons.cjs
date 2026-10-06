const sharp = require('sharp');
const path = require('path');

const svgFile = path.join(__dirname, 'public', 'logo-hospital.svg');

async function createIcon(size, outputName) {
  try {
    await sharp(svgFile)
      .resize(size, size)
      // Agregamos un fondo blanco en caso de que sea transparente (mejor compatibilidad)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toFile(path.join(__dirname, 'public', outputName));
    console.log(`Creado ${outputName}`);
  } catch (err) {
    console.error(`Error creando ${outputName}:`, err);
  }
}

async function run() {
  await createIcon(192, 'pwa-192x192.png');
  await createIcon(512, 'pwa-512x512.png');
}

run();
