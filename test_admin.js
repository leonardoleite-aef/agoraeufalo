const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.config/configstore/firebase-tools.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = config.tokens.refresh_token;

initializeApp({
  credential: admin.credential.refreshToken(refreshToken),
  projectId: 'agoraeufalo-3463a'
});
const db = getFirestore();
db.collection('courses').limit(1).get().then(() => console.log('Admin SDK works with refresh token!')).catch(e => console.error(e));
