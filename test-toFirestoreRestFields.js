const fs = require('fs');
function toFirestoreRestFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || typeof v === "function" || k === "modules" || k === "lessons") continue;

    if (Array.isArray(v) && k !== "sentences" && k !== "chunks" && k !== "exercises" && k !== "media" && k !== "downloads") {
      fields[k] = {
        arrayValue: {
          values: v.map(str => ({ stringValue: String(str) }))
        }
      };
      continue;
    }

    if (k === "sentences" && Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(s => ({
            mapValue: {
              fields: {
                id: { integerValue: String(s.id || 1) },
                en: { stringValue: String(s.en || "") },
                pt: { stringValue: String(s.pt || "") },
                audioUrl: { stringValue: String(s.audioUrl || "") },
                speaker: { stringValue: String(s.speaker || "") }
              }
            }
          }))
        }
      };
      continue;
    }

    if (k === "chunks" && Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(c => ({
            mapValue: {
              fields: {
                id: { integerValue: String(c.id || 1) },
                en: { stringValue: String(c.en || "") },
                pt: { stringValue: String(c.pt || "") },
                audioUrl: { stringValue: String(c.audioUrl || "") }
              }
            }
          }))
        }
      };
      continue;
    }

    if (k === "exercises" && Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(e => ({
            mapValue: {
              fields: {
                id: { integerValue: String(e.id || 1) },
                type: { stringValue: String(e.type || "") },
                question: { stringValue: String(e.question || "") },
                audioUrl: { stringValue: String(e.audioUrl || "") }
              }
            }
          }))
        }
      };
      continue;
    }

    if (k === "media" && Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(m => ({
            mapValue: {
              fields: {
                id: { integerValue: String(m.id || 1) },
                type: { stringValue: String(m.type || "") },
                url: { stringValue: String(m.url || "") },
                title: { stringValue: String(m.title || "") }
              }
            }
          }))
        }
      };
      continue;
    }
    
    if (k === "downloads" && Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(d => ({
            mapValue: {
              fields: {
                id: { integerValue: String(d.id || 1) },
                title: { stringValue: String(d.title || "") },
                url: { stringValue: String(d.url || "") }
              }
            }
          }))
        }
      };
      continue;
    }

    if (v === null) {
      fields[k] = { nullValue: null };
    } else if (typeof v === "boolean") {
      fields[k] = { booleanValue: v };
    } else if (typeof v === "number") {
      if (Number.isInteger(v)) {
        fields[k] = { integerValue: String(v) };
      } else {
        fields[k] = { doubleValue: v };
      }
    } else if (typeof v === "object" && k === "access") {
      fields[k] = {
        mapValue: {
          fields: {
            entitlements: { arrayValue: { values: (v.entitlements || []).map(str => ({ stringValue: String(str) })) } },
            requiresProductId: { arrayValue: { values: (v.requiresProductId || []).map(str => ({ stringValue: String(str) })) } },
            legacyGrantIds: { arrayValue: { values: (v.legacyGrantIds || []).map(str => ({ stringValue: String(str) })) } }
          }
        }
      };
    } else if (typeof v === "object" && k !== "access") {
      fields[k] = { stringValue: JSON.stringify(v) };
    } else {
      fields[k] = { stringValue: String(v) };
    }
  }
  return fields;
}

const payload = {
  id: "ms-legacy",
  title: "Magic Stories Legacy",
  salesUrl: "https://agoraeufalo.com.br",
  access: {
    entitlements: ["member_pago"],
    requiresProductId: [],
    legacyGrantIds: []
  }
};

console.log(JSON.stringify({ fields: toFirestoreRestFields(payload) }, null, 2));
