const fs = require('fs');
let content = fs.readFileSync('assets/js/aef-access-engine.js', 'utf8');

const oldCheck = `
      if (course.accessTier === 'standalone') {
        return false; // Apenas compras diretas dão acesso (já validado no passo 3)
      }
`;

const newCheck = `
      if (course.accessTier === 'standalone') {
        // Se for standalone, checa se tem exceção de legado
        if (Array.isArray(course.legacyGrants) && course.legacyGrants.length > 0) {
           if (userCats.some(cat => course.legacyGrants.includes(cat))) return true;
        }
        return false; // Apenas compras diretas dão acesso (já validado no passo 3)
      }
`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('assets/js/aef-access-engine.js', content);
console.log("Patched hasAccess in aef-access-engine.js");
