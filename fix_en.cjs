const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path');

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, 'google-credentials.json'),
});

const baseAudioDir = path.join(__dirname, 'public', 'audio');

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

  const request = {
    input: { text: text },
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

async function run() {
  await generateMp3('Now serving,', 'en-US', 'en-US-Chirp3-HD-Achernar', 'en', 'turno.mp3');
  console.log('Done!');
}

run();
