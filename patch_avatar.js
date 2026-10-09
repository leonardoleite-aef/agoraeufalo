const fs = require('fs');

function patchFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (content.includes('const isLL =')) return; // already patched
  
  const search = `
      if (headerInitials) headerInitials.innerText = initials;
      if (drawerInitials) drawerInitials.innerText = initials;
      if (modalInitials) modalInitials.innerText = initials;`;
      
  const replacement = `
      const isLL = initials === 'LL' || effEmail.includes('selexenglish');
      const avatarHtml = \`<img src="/assets/images/leonardo-leite.png" alt="Leonardo Leite" class="w-full h-full object-cover rounded-full">\`;
      
      const updateAvatar = (el) => {
        if (!el) return;
        if (isLL) {
           el.innerHTML = avatarHtml;
           if (el.parentElement) el.parentElement.classList.add('overflow-hidden');
        } else {
           el.innerText = initials;
           if (el.parentElement) el.parentElement.classList.remove('overflow-hidden');
        }
      };

      updateAvatar(headerInitials);
      updateAvatar(drawerInitials);
      updateAvatar(modalInitials);`;
      
  if (content.includes(search)) {
    content = content.replace(search, replacement);
    fs.writeFileSync(filepath, content);
    console.log(`Patched ${filepath}`);
  } else {
    console.log(`Search block not found in ${filepath}`);
  }
}

patchFile('portal.html');
patchFile('portal-lab.html');
patchFile('curso.html');
