const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.config/configstore/firebase-tools.json')));
const token = config.tokens.refresh_token;

const credObj = {
    type: "authorized_user",
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    refresh_token: token
};
fs.writeFileSync('temp_cred.json', JSON.stringify(credObj));
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve('temp_cred.json');

initializeApp({
  credential: applicationDefault(),
  projectId: 'agoraeufalo-3463a'
});

const db = getFirestore();
db.collection('courses').limit(1).get()
  .then(() => console.log('SUCCESS! ADC works!'))
  .catch(e => console.error('ERROR:', e.message));
