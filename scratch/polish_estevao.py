#!/usr/bin/env python3
import json
import re

with open("treino/data/estevao.js", "r", encoding="utf-8") as f:
    content = f.read()

# Extract json
start_token = "sentences: ["
start_idx = content.find(start_token) + len(start_token) - 1
end_idx = content.rfind("]") + 1

cards = json.loads(content[start_idx:end_idx])

# Polish grammar & trailing punctuation
for i in range(len(cards)):
    text = cards[i]["text"].strip()
    
    # Fix trailing single pronoun/preposition if split from next sentence
    if text.endswith(" I") and i + 1 < len(cards):
        text = text[:-2].strip()
        cards[i+1]["text"] = "I " + cards[i+1]["text"].strip()
    
    # Ensure capitalization at start
    if text and text[0].islower():
        text = text[0].upper() + text[1:]
    
    # Fix spacing around punctuation
    text = re.sub(r'\s+([,.:;?!])', r'\1', text)
    text = re.sub(r'\s{2,}', ' ', text)
    
    cards[i]["text"] = text

# Update estevao.js
new_json = json.dumps(cards, indent=8, ensure_ascii=False)
new_content = content[:start_idx] + new_json + content[end_idx:]

with open("treino/data/estevao.js", "w", encoding="utf-8") as f:
    f.write(new_content)

print("✨ Cleaned and formatted 143 cards in estevao.js")
