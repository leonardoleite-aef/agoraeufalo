const fs = require('fs');
const content = fs.readFileSync('portal.html', 'utf8');

const start = content.indexOf('const res = await fetch("https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses");');
console.log(content.substring(start - 100, start + 1000));
