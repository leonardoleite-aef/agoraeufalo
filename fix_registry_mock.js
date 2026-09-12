const fs = require('fs');
let content = fs.readFileSync('assets/js/aef-courses-registry.js', 'utf8');

// Remove the standaloneCheckoutHotmart I added to dtc_curso
content = content.replace(
  '"standaloneCheckoutHotmart": "https://pay.hotmart.com/T107479074N?off=mgwnab3h",\n    "description": "Aprenda tudo sobre datas',
  '"description": "Aprenda tudo sobre datas'
);

// Remove the standaloneCheckoutHotmart I added to english-quickstart
content = content.replace(
  '"standaloneCheckoutHotmart": "https://pay.hotmart.com/T107479074N?off=mgwnab3h",\n    "description": "Aqueça os motores',
  '"description": "Aqueça os motores'
);

fs.writeFileSync('assets/js/aef-courses-registry.js', content);
console.log("Reverted mock changes to registry.");
