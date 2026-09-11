const fs = require('fs');
const html = fs.readFileSync('treino/player.html', 'utf8');
const scriptMatch = html.match(/<script>\s*([\s\S]*?)<\/script>/g);
if (scriptMatch) {
  scriptMatch.forEach((s, i) => {
    fs.writeFileSync(`extracted_${i}.js`, s.replace(/<\/?script>/g, ''));
    console.log(`Checking script block ${i}`);
    try {
      require('child_process').execSync(`node -c extracted_${i}.js`);
    } catch (e) {
      console.log(`Error in block ${i}`);
    }
  });
}
