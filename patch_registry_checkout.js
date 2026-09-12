const fs = require('fs');
let content = fs.readFileSync('assets/js/aef-courses-registry.js', 'utf8');

// Add standaloneCheckoutHotmart to dtc_curso
content = content.replace(
  '"description": "Aprenda tudo sobre datas',
  '"standaloneCheckoutHotmart": "https://pay.hotmart.com/T107479074N?off=mgwnab3h",\n    "description": "Aprenda tudo sobre datas'
);

// Add standaloneCheckoutHotmart to english-quickstart
content = content.replace(
  '"description": "Aqueça os motores',
  '"standaloneCheckoutHotmart": "https://pay.hotmart.com/T107479074N?off=mgwnab3h",\n    "description": "Aqueça os motores'
);

fs.writeFileSync('assets/js/aef-courses-registry.js', content);
console.log("Patched registry checkouts.");
