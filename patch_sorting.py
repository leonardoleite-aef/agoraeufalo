with open('blog/index.html', 'r') as f:
    content = f.read()

import re
old_code = """              livePublishedPosts = [...firestoreList, ...nonDuplicatedSeeds];
              renderBlogFeed();"""

new_code = """              livePublishedPosts = [...firestoreList, ...nonDuplicatedSeeds];
              // Sort by date descending so the newest post is ALWAYS the Hero post
              livePublishedPosts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
              renderBlogFeed();"""

content = content.replace(old_code, new_code)

with open('blog/index.html', 'w') as f:
    f.write(content)

print("Sorting patched in blog/index.html")
