const fs = require('fs');
let content = fs.readFileSync('admin-alunos.html', 'utf8');

const mocksBlock = `    const INITIAL_VIP_FALLBACK = [
      { id: "andre", name: "André Barrote", email: "andrebarrote1992@gmail.com", tier: "vip_mentorship", role: "student", tracksCount: 1, enrolledProducts: ["ms-legacy", "mentoria_vip", "mentoria-andre"] },
      { id: "estevao", name: "Estêvão Pinheiro", email: "estevaopin@gmail.com", tier: "vip_mentorship", role: "student", tracksCount: 4, enrolledProducts: ["ms-legacy", "mentoria_vip"] },
      { id: "thomas", name: "Thomas", email: "thomas@agoraeufalo.com.br", tier: "vip_mentorship", role: "student", tracksCount: 6, enrolledProducts: ["ms-legacy", "mentoria_vip"] },
      { id: "matheus", name: "Matheus", email: "matheus@agoraeufalo.com.br", tier: "vip_mentorship", role: "student", tracksCount: 1, enrolledProducts: ["ms-legacy", "mentoria_vip"] }
    ];`;

content = content.replace(mocksBlock, '');

const loadMocksBlock = `      // 2. Add Fallback Mentees
      INITIAL_VIP_FALLBACK.forEach(m => {
        const email = (m.email || '').toLowerCase().trim();
        if (email) combined.set(email, { ...combined.get(email), ...m, tier: 'vip_mentorship', origem: 'vip' });
      });`;

content = content.replace(loadMocksBlock, '');

fs.writeFileSync('admin-alunos.html', content);
console.log("Mocks removed");
