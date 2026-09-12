const fs = require('fs');
let content = fs.readFileSync('assets/js/aef-access-engine.js', 'utf8');

// Update resolveCourseCategories to respect accessTier and legacyGrants
const oldFunc = 'function resolveCourseCategories(course) {';
const newFunc = `function resolveCourseCategories(course) {
    if (!course) return [];

    const cats = [];
    
    // Support new accessTier from admin-cursos
    if (course.accessTier === 'free') {
      cats.push(PRODUCT_ACCESS_CATEGORIES.FREE, PRODUCT_ACCESS_CATEGORIES.PAGO);
    } else if (course.accessTier === 'all_access') {
      cats.push(PRODUCT_ACCESS_CATEGORIES.PAGO);
    } else if (course.accessTier === 'standalone') {
      // It's a standalone course. Access is granted individually via user.enrolledProducts,
      // handled elsewhere. But we can push a special tag or just leave it empty.
      // Wait, let's just leave it empty so only explicit enrollments grant access.
    }

    // Support legacyGrants array from admin-cursos
    if (Array.isArray(course.legacyGrants)) {
      course.legacyGrants.forEach(lg => cats.push(lg));
    }

    // Support older formats
    if (Array.isArray(course.accessCategories)) {
      course.accessCategories.forEach(c => cats.push(c));
    } else if (course.tierRequired) {
      const legacyCats = migrateTierRequiredToCategories(course.tierRequired);
      legacyCats.forEach(c => cats.push(c));
    }

    return cats;
  }`;

if (content.includes(oldFunc)) {
    // We need to replace the entire old function
    const parts = content.split('function resolveCourseCategories(course) {');
    const funcEnd = parts[1].indexOf('function hasAccessToCourse');
    const newContent = parts[0] + newFunc + '\\n\\n  ' + parts[1].substring(funcEnd);
    fs.writeFileSync('assets/js/aef-access-engine.js', newContent);
    console.log("Patched aef-access-engine.js");
} else {
    console.log("Could not find function marker in aef-access-engine.js");
}
