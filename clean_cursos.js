const fs = require('fs');
let content = fs.readFileSync('cursos.html', 'utf8');

const modalHTMLStart = `  <!-- MODAL POPUP DE CHECKOUT INTERNO (HOTMART IN-PAGE POPUP)                  -->`;
const modalHTMLEnd = `<!-- O iframe do checkout será injetado dinamicamente no clique -->
      </div>

    </div>
  </div>`;

// Extract the modal HTML
const startIdx = content.indexOf(modalHTMLStart);
const endIdx = content.indexOf(modalHTMLEnd) + modalHTMLEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
    const modalHTML = content.substring(startIdx, endIdx);
    
    // Remove it from the head
    content = content.substring(0, startIdx) + content.substring(endIdx);
    
    // Insert it right before the bottom <script>
    const bodyScriptIdx = content.lastIndexOf('<script>');
    content = content.substring(0, bodyScriptIdx) + '\n' + modalHTML + '\n\n  ' + content.substring(bodyScriptIdx);
    
    fs.writeFileSync('cursos.html', content);
    console.log("Moved modal to bottom of body.");
} else {
    console.log("Could not find modal bounds.");
}
