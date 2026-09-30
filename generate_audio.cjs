const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path');

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, 'google-credentials.json'),
});

const baseAudioDir = path.join(__dirname, 'public', 'audio');

// Configuración base del audio
const audioConfig = {
  audioEncoding: 'MP3',
  speakingRate: 1.0,
  pitch: 0,
};



async function generateMp3(text, langCode, voiceName, folder, filename) {
  const dirPath = path.join(baseAudioDir, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // El texto se envía limpio sin prompt de estilo para evitar que la IA lo lea
  const fullText = text;

  const request = {
    input: { text: fullText },
    voice: { languageCode: langCode, name: voiceName },
    audioConfig: audioConfig,
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    const filePath = path.join(dirPath, filename);
    await writeFile(filePath, response.audioContent, 'binary');
    console.log(`Guardado [${folder}]: ${filename}`);
  } catch (error) {
    console.error(`Error generando ${filename} en ${folder}:`, error);
  }
}

async function runForLanguage(langCode, voiceName, folder, prefixText) {
  console.log(`\nIniciando generación para: ${folder} (${langCode})`);
  
  // 1. Generar prefijo
  await generateMp3(prefixText, langCode, voiceName, folder, 'turno.mp3');
  await new Promise(r => setTimeout(r, 200));

  // 2. Generar Letras A-Z
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (const letter of alphabet) {
    await generateMp3(letter, langCode, voiceName, folder, `${letter}.mp3`);
    await new Promise(r => setTimeout(r, 200));
  }

  // 3. Generar Números 0-99
  for (let i = 0; i <= 99; i++) {
    await generateMp3(`${i}`, langCode, voiceName, folder, `${i}.mp3`);
    await new Promise(r => setTimeout(r, 200));
  }
}

async function run() {
  // Generar audios en Español
  await runForLanguage('es-US', 'es-US-Chirp3-HD-Achernar', 'es', 'Es el turno de...');
  
  // Generar audios en Inglés
  await runForLanguage('en-US', 'en-US-Chirp3-HD-Achernar', 'en', 'It is the turn of...');

  console.log('\n¡Todos los audios bilingües han sido generados exitosamente!');
}

run();
