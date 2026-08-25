/**
 * Test Firebase Email Link Dispatch via Identity Toolkit REST API
 */
const https = require('https');

const FIREBASE_API_KEY = "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";
const targetEmail = "selexenglish@gmail.com";

const payload = JSON.stringify({
  requestType: "EMAIL_SIGNIN",
  email: targetEmail,
  continueUrl: "https://agoraeufalo.com.br/login.html?magicLink=true",
  canHandleCodeInApp: true
});

const options = {
  hostname: 'identitytoolkit.googleapis.com',
  path: `/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log(`📡 Disparando teste de envio de email para ${targetEmail}...`);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Resposta Google Firebase:`, data);
  });
});

req.on('error', (err) => {
  console.error("Erro na requisição:", err);
});

req.write(payload);
req.end();
