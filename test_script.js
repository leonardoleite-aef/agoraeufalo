try {
  // Test if it parses without throwing SyntaxError
  require('vm').Script(`
    lucide = { createIcons: () => {} };
    document = {};
    window = {};
    
    // ... paste JS logic here to test syntax ...
  `);
  console.log("No syntax errors");
} catch(e) {
  console.log("Error:", e);
}
