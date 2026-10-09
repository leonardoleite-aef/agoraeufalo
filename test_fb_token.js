const auth = require('firebase-tools/lib/auth');
auth.getAccessToken().then(token => console.log('Token:', token.access_token)).catch(e => console.error(e));
