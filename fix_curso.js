const fs = require('fs');
let code = fs.readFileSync('curso.html', 'utf8');

code = code.replace(
  `const user = auth ? { ...(auth.getProfile() || {}), purchasedProducts: (auth.getEnrolledProducts() || []) } : null;`,
  `const user = auth ? { ...(auth.getProfile() || {}), purchasedProducts: (auth.getEnrolledProducts() || []), role: auth.isAdmin() ? 'admin' : ((auth.getProfile()||{}).role || 'student') } : null;`
);

fs.writeFileSync('curso.html', code);
