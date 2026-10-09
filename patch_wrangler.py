import json

with open('wrangler.json', 'r') as f:
    config = json.load(f)

config['r2_buckets'] = [
    {
        "binding": "AEF_MEDIA",
        "bucket_name": "aef-media"
    }
]

with open('wrangler.json', 'w') as f:
    json.dump(config, f, indent=2)

