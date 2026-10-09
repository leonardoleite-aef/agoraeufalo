with open('src/worker.js', 'r') as f:
    content = f.read()
content = content.replace("if (host === 'podcast.agoraeufalo.com.br') {", "if (host === 'podcast.agoraeufalo.com.br' || host.startsWith('agoraeufalo')) { // Permite teste via .workers.dev")
with open('src/worker.js', 'w') as f:
    f.write(content)
