const fs = require('fs');
let code = fs.readFileSync('portal.html', 'utf8');

// 1. Fix isAdmin
code = code.replace(
  `      const profile = (window.aefPortalAuth && window.aefPortalAuth.currentProfile) || {};
      const userRole = profile.role || localStorage.getItem("aef_user_role") || "student";
      const userObj = {
        ...(profile || {}),
        uid: (profile && profile.uid) || (window.aefPortalAuth?.currentUser?.uid),
        role: isAdmin ? 'admin' : userRole,`,
  `      const profile = (window.aefPortalAuth && window.aefPortalAuth.currentProfile) || {};
      const userRole = profile.role || localStorage.getItem("aef_user_role") || "student";
      const dynamicIsAdmin = (window.aefPortalAuth && window.aefPortalAuth.isAdmin()) || userRole === 'admin' || isAdmin;
      const userObj = {
        ...(profile || {}),
        uid: (profile && profile.uid) || (window.aefPortalAuth?.currentUser?.uid),
        role: dynamicIsAdmin ? 'admin' : userRole,`
);

code = code.replace(
  `isOnlyFree = !isAdmin && (nonFreeCats.length === 0);`,
  `isOnlyFree = !dynamicIsAdmin && (nonFreeCats.length === 0);`
);

code = code.replace(
  `isOnlyFree = !isAdmin && (currentTier === 'free') && (!enrolledProducts || enrolledProducts.length === 0);`,
  `isOnlyFree = !dynamicIsAdmin && (currentTier === 'free') && (!enrolledProducts || enrolledProducts.length === 0);`
);

// 2. Fix duplicates
const regexToRemove = /          \/\/ ——— 2\. SEÇÃO "CATÁLOGO COMPLETO DE CURSOS" \(RENDERIZA TODOS OS CURSOS\) ———\n          if \(hasAccess\) \{\n            \/\/ Card Liberado\n            allCoursesHtml \+= `[\s\S]*?`;\n          \} else \{\n            \/\/ Card Bloqueado/g;

code = code.replace(regexToRemove, `          // ——— 2. SEÇÃO "CATÁLOGO COMPLETO DE CURSOS" (RENDERIZA TODOS OS CURSOS) ———\n          if (!hasAccess) {\n            // Card Bloqueado`);

fs.writeFileSync('portal.html', code);
