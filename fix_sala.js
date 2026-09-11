const fs = require('fs');
let code = fs.readFileSync('sala-de-aula.html', 'utf8');

code = code.replace(
  `hasAccess = window.AEFAccessEngine ? window.AEFAccessEngine.hasAccess(courseId, userProfile) : true;`,
  `hasAccess = window.AEFAccessEngine ? window.AEFAccessEngine.hasAccess(userProfile, baseCourses[courseId]) : true;`
);

code = code.replace(
  `if (window.AEFAccessEngine && window.AEFAccessEngine.hasAccess(cid, userProfile)) {`,
  `if (window.AEFAccessEngine && window.AEFAccessEngine.hasAccess(userProfile, baseCourses[cid])) {`
);

fs.writeFileSync('sala-de-aula.html', code);
