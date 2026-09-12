const fs = require('fs');
const path = require('path');

const projeto = fs.readFileSync('projeto-aef.html', 'utf8');
const precos = fs.readFileSync('precos.html', 'utf8');

// Get everything from projeto-aef.html up to the end of BLOCK 6 (depoimentos)
const projetoTop = projeto.split('<!-- ========================================================================= -->\n  <!-- [BLOCO 7] OFERTA E MATRÍCULA (PROJETO 2026)                               -->')[0];

// From precos, extract the Pricing block
// It starts at: <!-- 3. GRADE DE PRECIFICAÇÃO
const precosPricingStart = precos.indexOf('<!-- 3. GRADE DE PRECIFICAÇÃO');
const precosPricingEnd = precos.indexOf('<!-- ========================================================================= -->\n    <!-- 4. BOX DE GARANTIA INCONDICIONAL DE 7 DIAS');
let pricingBlock = precos.slice(precosPricingStart, precosPricingEnd);

// Wrap pricing block in a <div id="planos"> or just add the ID to the section
pricingBlock = pricingBlock.replace('<section class="relative', '<section id="planos" class="relative');

// From precos, extract Guarantee, FAQ and Contact Leo
const guaranteeStart = precos.indexOf('<!-- 4. BOX DE GARANTIA INCONDICIONAL DE 7 DIAS');
const contactEnd = precos.indexOf('<!-- 7. FOOTER INSTITUCIONAL');
const guaranteeFaqContact = precos.slice(guaranteeStart, contactEnd);

// Footer and end of file from projeto-aef
const projetoBottom = projeto.substring(projeto.indexOf('<!-- ========================================================================= -->\n  <!-- [BLOCO 11] FOOTER'));

let aefclub = projetoTop + '\n  <!-- ========================================================================= -->\n  ' + pricingBlock + '\n  <!-- ========================================================================= -->\n  ' + guaranteeFaqContact + '\n  ' + projetoBottom;

// Need to update links in the merged file
aefclub = aefclub.replace(/projeto-aef\.html/g, 'aefclub.html');
aefclub = aefclub.replace(/precos\.html/g, 'aefclub.html#planos');

fs.writeFileSync('aefclub.html', aefclub);
console.log('Merge complete');
