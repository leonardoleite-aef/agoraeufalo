try {
  const fs = require('fs');
  const content = fs.readFileSync('cursos.html', 'utf8');
  const scriptContent = content.substring(content.lastIndexOf('<script>') + 8, content.lastIndexOf('</script>'));
  
  // Just parsing it
  new Function(scriptContent);
  console.log("No syntax errors");
} catch(e) {
  console.log("Error:", e);
}
