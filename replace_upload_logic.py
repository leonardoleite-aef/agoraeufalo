import re

with open('blog-panel.html', 'r') as f:
    content = f.read()

# Replace _uploadToStorage completely
old_upload = """    async function _uploadToStorage(blob, fileName, mimeType, onProgress) {
      const token = await _getAuthToken();
      const headers = { 'Content-Type': mimeType };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      // Firebase Storage REST upload (multipart não disponível via REST simples → usa media upload)
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/agoraeufalo-3463a.firebasestorage.app/o?uploadType=media&name=${encodeURIComponent(fileName)}`;

      // Usa XHR para ter progresso
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        if (onProgress) xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
        });
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${data.bucket}/o/${encodeURIComponent(data.name)}?alt=media&token=${data.downloadTokens}`;
            resolve(downloadUrl);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(blob);
      });
    }"""

new_upload = """    async function _uploadToStorage(blob, fileName, mimeType, onProgress) {
      const token = await _getAuthToken();
      
      // Upload Direto para o Cloudflare R2 via Edge Worker
      // Removendo o custo absurdo do Firebase Storage para Áudio/Vídeo!
      const uploadUrl = `https://agoraeufalo.com.br/api/admin/upload`; // Nosso novo endpoint

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('X-File-Name', fileName);
        xhr.setRequestHeader('X-Content-Type', mimeType);
        
        if (onProgress) xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
        });
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url); // A URL limpa e direta do media.agoraeufalo.com.br
          } else {
            reject(new Error('R2 Upload failed: ' + xhr.responseText));
          }
        };
        xhr.onerror = () => reject(new Error('Network error on R2 upload'));
        xhr.send(blob); // O body vai cru, em formato binário, direto pro Worker.
      });
    }"""

content = content.replace(old_upload, new_upload)

with open('blog-panel.html', 'w') as f:
    f.write(content)
print("Replaced upload logic")

