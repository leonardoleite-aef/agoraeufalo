const fs = require('fs');
let content = fs.readFileSync('assets/js/aef-access-engine.js', 'utf8');

const oldCheck = `      if (course.accessTier === 'all_access') {
        return userCats.some(cat => [MEMBER_CATEGORIES.PAGO, MEMBER_CATEGORIES.MENTORIA, MEMBER_CATEGORIES.LEGADO_1, MEMBER_CATEGORIES.LEGADO_2].includes(cat));
      }`;

const newCheck = `      if (course.accessTier === 'all_access') {
        let allowedCats = [MEMBER_CATEGORIES.PAGO, MEMBER_CATEGORIES.MENTORIA];
        if (course.legacyGrants) {
          allowedCats = allowedCats.concat(course.legacyGrants);
        } else {
          // Fallback para manter o acesso até o curso ser salvo novamente no painel
          allowedCats.push(MEMBER_CATEGORIES.LEGADO_1, MEMBER_CATEGORIES.LEGADO_2);
        }
        return userCats.some(cat => allowedCats.includes(cat));
      }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('assets/js/aef-access-engine.js', content);
console.log("Patched all_access in aef-access-engine.js");
