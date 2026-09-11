const fs = require('fs');
let code = fs.readFileSync('sala-de-aula.html', 'utf8');

code = code.replace(
  `userProfile = window.aefPortalAuth.getProfile();`,
  `userProfile = window.aefPortalAuth.getProfile();
          if (userProfile) {
            userProfile.role = window.aefPortalAuth.isAdmin() ? 'admin' : (userProfile.role || 'student');
            userProfile.purchasedProducts = window.aefPortalAuth.getEnrolledProducts() || userProfile.enrolledProducts || [];
          }`
);

fs.writeFileSync('sala-de-aula.html', code);
