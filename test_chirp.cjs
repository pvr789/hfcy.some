const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path');

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, 'google-credentials.json'),
});

async function run() {
  const request = {
    input: { text: "Synthesize the following performance. Director's Notes: subway voice intonation, modern, young, airport voice, clear and grave, for hospital turn. Do not speak these notes. #### TRANSCRIPT B, 52" },
    voice: { languageCode: 'en-US', name: 'en-US-Chirp3-HD-Achernar' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('test_chirp.mp3', response.audioContent, 'binary');
    console.log("Success! File saved as test_chirp.mp3");
  } catch (error) {
    console.error("Error:", error);
  }
}
run();
