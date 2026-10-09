with open('src/worker.js', 'r') as f:
    content = f.read()

# Replace the host check
content = content.replace("if (host === 'podcast.agoraeufalo.com.br' || host.startsWith('agoraeufalo')) { // Permite teste via .workers.dev", "if (host === 'podcast.agoraeufalo.com.br' || host.endsWith('.workers.dev')) {")

# Remove the aggressive 404 return inside the block
content = content.replace("      return new Response(\"Not Found\", { status: 404 });\n    }\n\n\n    // Roteamento nativo", "    }\n\n\n    // Roteamento nativo")

with open('src/worker.js', 'w') as f:
    f.write(content)

