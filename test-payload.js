const fs = require('fs');
// simulate normalizeCourseSafe
function normalizeCourseSafe(course) {
  const id = String(course.id || "");
  const title = course.title || id;
  const accessTier = course.accessTier || "all_access";
  const access = {
    entitlements: ["member_pago"],
    requiresProductId: [],
    legacyGrantIds: []
  };
  return {
    ...course,
    schemaVersion: 2,
    id,
    title,
    accessTier,
    access
  };
}

const payload = normalizeCourseSafe({
  id: 'ms-legacy',
  salesUrl: 'https://agoraeufalo.com.br',
  undefinedField: undefined
});

console.log("Firebase SDK allows undefined? NO. It throws.");
