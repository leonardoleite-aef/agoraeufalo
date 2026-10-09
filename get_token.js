const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.config/configstore/firebase-tools.json')));
const refresh = config.tokens.refresh_token;

fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
        refresh_token: refresh,
        grant_type: 'refresh_token'
    })
})
.then(r => r.json())
.then(d => {
    if (d.access_token) {
        console.log("SUCCESS", d.access_token.substring(0, 10));
    } else {
        console.log("FAILED", d);
    }
});
