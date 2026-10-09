with open('src/worker.js', 'r') as f:
    content = f.read()

# Extract the podcast block
podcast_block_start = content.find("    // 0. SUBDOMÍNIO DE PODCAST (podcast.agoraeufalo.com.br)")
podcast_block_end = content.find("    // ============================================================\n    // 1. SUBDOMÍNIO ADMIN (admin.agoraeufalo.com.br)")

if podcast_block_start != -1 and podcast_block_end != -1:
    podcast_code = content[podcast_block_start:podcast_block_end]
    # Remove podcast code from its current position
    content = content[:podcast_block_start] + content[podcast_block_end:]
    
    # Find insertion point: right after path normalization
    insertion_point = content.find("    // Roteamento nativo para Edge API (/api/*)")
    if insertion_point != -1:
        content = content[:insertion_point] + podcast_code + "\n" + content[insertion_point:]
    
    with open('src/worker.js', 'w') as f:
        f.write(content)
    print("Patched!")
else:
    print("Block not found")

