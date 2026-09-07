const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      if (item === 'node_modules' || item === '.git' || item === '.venv' || item === '.gemini' || item === 'dist' || item === 'storage_staging' || item === 'tmp') continue;
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    // Only copy if file doesn't already exist or was modified
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy all root HTML files and metadata
const rootFiles = fs.readdirSync(rootDir);
for (const file of rootFiles) {
  if (file.endsWith('.html') || file.endsWith('.xml') || file.endsWith('.txt') || file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.ico')) {
    fs.copyFileSync(path.join(rootDir, file), path.join(distDir, file));
  }
}

// 2. Copy directories
const dirsToCopy = ['assets', 'treino', 'blog', 'Material-PDF', 'aef_ebook', 'historico', 'migracao'];
for (const dir of dirsToCopy) {
  copyRecursive(path.join(rootDir, dir), path.join(distDir, dir));
}

console.log('✅ [build_dist.js] All ecosystem static assets & HTML pages successfully synced to /dist!');
