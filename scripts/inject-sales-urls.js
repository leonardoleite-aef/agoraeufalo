const fs = require('fs');

const path = '/Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-courses-registry.js';
let content = fs.readFileSync(path, 'utf8');

const mapping = {
  'ms-legacy': 'https://agoraeufalo.com.br/lp-magic-stories-legacy.html',
  'fs-aef-ec': 'https://agoraeufalo.com.br/lp-first-steps.html',
  'english-quickstart': 'https://agoraeufalo.com.br/lp-english-quickstart.html',
  'dtc_curso': 'https://agoraeufalo.com.br/lp-dates-and-times.html',
  'airport_flight_level_1': 'https://agoraeufalo.com.br/lp-airport-and-flights.html'
};

for (const [courseId, url] of Object.entries(mapping)) {
  // Regex to find the start of the course object: "courseId": { ...
  // and inject salesUrl right after it.
  const regex = new RegExp('(\\"' + courseId + '\\"\\s*:\\s*\\{)', 'g');
  
  // First, check if salesUrl already exists in that course block
  // This is tricky without AST, but we can just replace.
  content = content.replace(regex, `$1\n    "salesUrl": "${url}",`);
}

fs.writeFileSync(path, content);
console.log('salesUrl inseridas no registry.');
