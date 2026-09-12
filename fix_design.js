const fs = require('fs');
let content = fs.readFileSync('aefclub.html', 'utf8');

// 1. Remove the inline style from planos
content = content.replace('style="background-color: #060D17;" ', '');

// 2. We will wrap from GRADE DE PRECIFICAÇÃO to just before FAQ
const startMarker = '<!-- 3. GRADE DE PRECIFICAÇÃO (DUAS COLUNAS: MENSAL VS ANUAL)                  -->';
const endMarker = '<!-- ========================================================================= -->\n    <!-- 5. PERGUNTAS FREQUENTES (FAQ DE MATRÍCULA & PAGAMENTO)                     -->';

if (content.includes(startMarker) && content.includes(endMarker)) {
    const parts1 = content.split(startMarker);
    const parts2 = parts1[1].split(endMarker);
    
    // parts1[0] is everything before
    // parts2[0] is everything between (pricing + guarantee)
    // parts2[1] is everything after
    
    const wrapperStart = `
  <!-- ========================================================================= -->
  <!-- WRAPPER DARK MODE PARA PRECIFICAÇÃO E GARANTIA                            -->
  <!-- ========================================================================= -->
  <div class="bg-[#060D17] w-full pt-16">
    ${startMarker}
`;
    const wrapperEnd = `
  </div>
  <!-- FIM DO WRAPPER DARK MODE -->
    ${endMarker}
`;

    content = parts1[0] + wrapperStart + parts2[0] + wrapperEnd + parts2[1];
    fs.writeFileSync('aefclub.html', content);
    console.log('Fixed design');
} else {
    console.log('Markers not found');
}
