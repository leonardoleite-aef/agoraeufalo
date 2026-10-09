import re

with open('firestore.rules', 'r') as f:
    content = f.read()

blog_rules = """
    // ========================================================================
    // 8. BLOG POSTS & PODCASTS (CMS Omnichannel)
    // Leitura: Pública para renderização na vitrine / blog.
    // Escrita: Exclusiva do Administrador Mestre.
    // ========================================================================
    match /blog_posts/{postId} {
      allow read: if true;
      allow write: if isAdmin();
    }
"""

insertion_point = content.find("    // ========================================================================\n    // 7. POLÍTICA PADRÃO ZERO TRUST")
if insertion_point != -1:
    content = content[:insertion_point] + blog_rules + "\n" + content[insertion_point:]
    with open('firestore.rules', 'w') as f:
        f.write(content)
    print("Patched firestore.rules")
else:
    print("Failed to patch rules")

