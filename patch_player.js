const fs = require('fs');
let code = fs.readFileSync('player.html', 'utf8');
code = code.replace(
  'hierarchy = await syncEngine.getCoursesHierarchy(window.AEF_COURSES_REGISTRY || null);',
  'hierarchy = await syncEngine.getCoursesHierarchy(window.AEF_COURSES_REGISTRY || null); console.log("getCoursesHierarchy returned", hierarchy);'
);
fs.writeFileSync('player.html', code);
