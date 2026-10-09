const https = require('https');

const mapping = {
  'ms-legacy': 'https://agoraeufalo.com.br/lp-magic-stories-legacy.html',
  'fs-aef-ec': 'https://agoraeufalo.com.br/lp-first-steps.html',
  'english-quickstart': 'https://agoraeufalo.com.br/lp-english-quickstart.html',
  'dtc_curso': 'https://agoraeufalo.com.br/lp-dates-and-times.html',
  'airport_flight_level_1': 'https://agoraeufalo.com.br/lp-airport-and-flights.html'
};

const projectId = "agoraeufalo-3463a";

async function updateCourse(id, url) {
  const payload = JSON.stringify({
    fields: {
      salesUrl: { stringValue: url }
    }
  });

  const options = {
    hostname: 'firestore.googleapis.com',
    port: 443,
    path: `/v1/projects/${projectId}/databases/(default)/documents/courses/${id}?updateMask.fieldPaths=salesUrl`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ [${id}] salesUrl updated!`);
          resolve(data);
        } else {
          console.error(`❌ [${id}] Failed: ${res.statusCode} ${data}`);
          reject(new Error(data));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  for (const [id, url] of Object.entries(mapping)) {
    try {
      await updateCourse(id, url);
    } catch (e) {
      console.error("Error for", id);
    }
  }
}

main();
