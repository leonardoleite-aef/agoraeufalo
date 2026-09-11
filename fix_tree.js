const fs = require('fs');
let code = fs.readFileSync('admin-cursos.html', 'utf8');

code = code.replace(
  `document.getElementById("treeCourseBadge").innerText = badgeText || (course.tierRequired || 'free').toUpperCase();`,
  `document.getElementById("treeCourseTitle").innerText = course.title || course.id;`
);

fs.writeFileSync('admin-cursos.html', code);
