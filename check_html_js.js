const fs = require('fs');
const html = fs.readFileSync('admin-alunos.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script.*?>([\s\S]*?)<\/script>/g)];
scriptMatches.forEach((match, index) => {
    try {
        new Function(match[1]);
        console.log(`Script ${index} is valid.`);
    } catch (e) {
        console.error(`Script ${index} syntax error:`, e.message);
    }
});
