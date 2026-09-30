const textToSpeech = require('@google-cloud/text-to-speech');
const path = require('path');
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, 'google-credentials.json'),
});
async function run() {
  const [result] = await client.listVoices({languageCode: 'es-MX'});
  const voices = result.voices;
  voices.forEach(v => {
    if (v.name.toLowerCase().includes('achernar') || v.name.toLowerCase().includes('chirp')) {
      console.log(v.name);
    }
  });
}
run();
