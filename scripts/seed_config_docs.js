#!/usr/bin/env node
/**
 * AgoraEuFalo • Externalização de Configurações no Firestore (P0-4)
 * Professor Leonardo Leite
 * 
 * Este script popula os documentos de configuração no Cloud Firestore:
 * 1. config/productMappings: Mapeamento de produtos Hotmart e avulsos para entitlements,
 *    categorias, cursos liberados e periodicidade de cobrança.
 * 2. config/vipOverrides: Lista dinâmica de e-mails VIP e superadmins com overrides
 *    de acesso, eliminando regras comerciais e e-mails hardcoded no Cloudflare Worker.
 */

const FIRESTORE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "agoraeufalo-3463a";
const FIRESTORE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";

function toFirestoreField(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (typeof val === "boolean") return { booleanValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreField) } };
  }
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreField(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && typeof v !== "function") {
      fields[k] = toFirestoreField(v);
    }
  }
  return fields;
}

function parseRestField(field) {
  if (!field) return null;
  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return parseInt(field.integerValue, 10);
  if ("doubleValue" in field) return parseFloat(field.doubleValue);
  if ("booleanValue" in field) return field.booleanValue;
  if ("nullValue" in field) return null;
  if ("timestampValue" in field) return field.timestampValue;
  if ("arrayValue" in field) {
    return Array.isArray(field.arrayValue?.values)
      ? field.arrayValue.values.map(parseRestField)
      : [];
  }
  if ("mapValue" in field) {
    const res = {};
    for (const [k, v] of Object.entries(field.mapValue?.fields || {})) {
      res[k] = parseRestField(v);
    }
    return res;
  }
  return null;
}

function parseRestDoc(doc, fallbackId = "") {
  if (!doc) return null;
  const docId = doc.name ? doc.name.split("/").pop() : fallbackId;
  const obj = { id: docId };
  for (const [k, v] of Object.entries(doc.fields || {})) {
    obj[k] = parseRestField(v);
  }
  return obj;
}

async function saveFirestoreDoc(collection, docId, data) {
  const fields = toFirestoreFields(data);
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIRESTORE_API_KEY}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status} ao gravar ${collection}/${docId}: ${txt}`);
  }

  return parseRestDoc(await res.json(), docId);
}

async function readFirestoreDoc(collection, docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return parseRestDoc(await res.json(), docId);
}

const PRODUCT_MAPPINGS_DATA = {
  schemaVersion: 2,
  description: "Mapeamento oficial de produtos Hotmart e avulsos para regras de entitlement e cursos",
  updatedAt: new Date().toISOString(),
  mappings: {
    "8460579": {
      productId: "8460579",
      productName: "AgoraEuFalo English Club",
      entitlement: "member_pago",
      categories: ["member_free", "member_pago"],
      billingPeriod: "annual",
      role: "student",
      enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
      grantsCourseIds: ["ms-legacy", "english-quickstart", "frases-prontas"]
    },
    "MAGIC_STORIES_CLUB": {
      productId: "MAGIC_STORIES_CLUB",
      productName: "AgoraEuFalo English Club (Assinatura Anual)",
      entitlement: "member_pago",
      categories: ["member_free", "member_pago"],
      billingPeriod: "annual",
      role: "student",
      enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
      grantsCourseIds: ["ms-legacy", "english-quickstart", "frases-prontas"]
    },
    "MS_CLUB_ANUAL": {
      productId: "MS_CLUB_ANUAL",
      productName: "AgoraEuFalo English Club • Assinatura Anual",
      entitlement: "member_pago",
      categories: ["member_free", "member_pago"],
      billingPeriod: "annual",
      role: "student",
      enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
      grantsCourseIds: ["ms-legacy", "english-quickstart", "frases-prontas"]
    },
    "MS_CLUB_MENSAL": {
      productId: "MS_CLUB_MENSAL",
      productName: "AgoraEuFalo English Club • Assinatura Mensal",
      entitlement: "member_pago",
      categories: ["member_free", "member_pago"],
      billingPeriod: "monthly",
      role: "student",
      enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
      grantsCourseIds: ["ms-legacy", "english-quickstart", "frases-prontas"]
    },
    "PROJETO_AEF_2026": {
      productId: "PROJETO_AEF_2026",
      productName: "Projeto AgoraEuFalo 2026 (Mentoria VIP)",
      entitlement: "member_mentoria",
      categories: ["member_free", "member_pago", "member_mentoria"],
      billingPeriod: "annual",
      role: "student",
      enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas", "mentoria_vip"],
      grantsCourseIds: ["ms-legacy", "english-quickstart", "frases-prontas", "mentoria_vip"]
    },
    "MENTORIA_VIP": {
      productId: "MENTORIA_VIP",
      productName: "Mentoria VIP Individual AgoraEuFalo",
      entitlement: "member_mentoria",
      categories: ["member_free", "member_pago", "member_mentoria"],
      billingPeriod: "annual",
      role: "student",
      enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas", "mentoria_vip"],
      grantsCourseIds: ["ms-legacy", "english-quickstart", "frases-prontas", "mentoria_vip"]
    },
    "airport_flight_level_1": {
      productId: "airport_flight_level_1",
      productName: "Aeroportos e Vôos - [Iniciante]",
      entitlement: "venda_avulsa",
      categories: ["member_free", "venda_avulsa"],
      billingPeriod: "lifetime",
      role: "student",
      enrolledProducts: ["airport_flight_level_1"],
      grantsCourseIds: ["airport_flight_level_1"]
    },
    "MS_LEGACY": {
      productId: "MS_LEGACY",
      productName: "Magic Stories Legacy • O Acervo Clássico",
      entitlement: "venda_avulsa",
      categories: ["member_free", "venda_avulsa"],
      billingPeriod: "lifetime",
      role: "student",
      enrolledProducts: ["ms-legacy"],
      grantsCourseIds: ["ms-legacy"]
    },
    "ENGLISH_QUICKSTART": {
      productId: "ENGLISH_QUICKSTART",
      productName: "English QuickStart • Fundamentos da Fala",
      entitlement: "venda_avulsa",
      categories: ["member_free", "venda_avulsa"],
      billingPeriod: "lifetime",
      role: "student",
      enrolledProducts: ["english-quickstart"],
      grantsCourseIds: ["english-quickstart"]
    },
    "FRASES_PRONTAS": {
      productId: "FRASES_PRONTAS",
      productName: "Frases Prontas • Automação Oral",
      entitlement: "venda_avulsa",
      categories: ["member_free", "venda_avulsa"],
      billingPeriod: "lifetime",
      role: "student",
      enrolledProducts: ["frases-prontas"],
      grantsCourseIds: ["frases-prontas"]
    }
  }
};

const VIP_OVERRIDES_DATA = {
  schemaVersion: 2,
  description: "Lista canônica de e-mails VIP e superadministradores com overrides de acesso",
  updatedAt: new Date().toISOString(),
  adminEmails: [
    "selexenglish@gmail.com"
  ],
  vipEmails: [
    "andrebarrote1992@gmail.com",
    "estevaopin@gmail.com",
    "mateus.s.gomes.novo@gmail.com",
    "thomasskt21@gmail.com",
    "selexenglish@gmail.com",
    "leonardo@agoraeufalo.com.br",
    "leo@agoraeufalo.com.br"
  ],
  overrides: {
    "andrebarrote1992@gmail.com": {
      tier: "vip_mentorship",
      role: "student",
      categories: ["member_free", "member_pago", "member_mentoria"],
      enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas", "mentoria_vip", "mentoria-andre"],
      studentId: "andre"
    },
    "estevaopin@gmail.com": {
      tier: "vip_mentorship",
      role: "student",
      categories: ["member_free", "member_pago", "member_mentoria"],
      enrolledProducts: ["airport_flight_level_1", "fs-aef-ec", "ms-legacy", "all_access_master", "mentoria_vip", "mentoria-estevaopin"],
      studentId: "estevaopin"
    },
    "mateus.s.gomes.novo@gmail.com": {
      tier: "vip_mentorship",
      role: "student",
      categories: ["member_free", "member_pago", "member_mentoria"],
      enrolledProducts: ["ms-legacy", "all_access_master", "mentoria_vip", "mentoria-mateus.s.gomes.novo"],
      studentId: "mateus.s.gomes.novo"
    },
    "thomasskt21@gmail.com": {
      tier: "vip_mentorship",
      role: "student",
      categories: ["member_free", "member_pago", "member_mentoria"],
      enrolledProducts: ["airport_flight_level_1", "ms-legacy", "all_access_master", "mentoria_vip", "mentoria-thomasskt21"],
      studentId: "thomasskt21"
    },
    "selexenglish@gmail.com": {
      tier: "vip_mentorship",
      role: "admin",
      categories: ["member_free", "member_pago", "member_mentoria"],
      enrolledProducts: [
        "all_access_master",
        "mentoria_vip",
        "ms-legacy",
        "english-quickstart",
        "frases-prontas",
        "dtc_curso",
        "aef-experience",
        "fs-aef-ec",
        "airport_flight_level_1"
      ],
      studentId: "selexenglish"
    }
  }
};

async function seedConfigDocs() {
  console.log("=================================================================");
  console.log("⚙️  AGORAEUFALO • EXTERNALIZAÇÃO DE CONFIGURAÇÕES FIRESTORE (P0-4)");
  console.log("=================================================================");
  console.log(`Projeto:     ${FIRESTORE_PROJECT_ID}`);
  console.log(`Timestamp:   ${new Date().toISOString()}`);
  console.log("-----------------------------------------------------------------");

  // 1. Gravar config/productMappings
  console.log("⏳ [1/2] Gravando config/productMappings...");
  const pmResult = await saveFirestoreDoc("config", "productMappings", PRODUCT_MAPPINGS_DATA);
  const pmVerified = await readFirestoreDoc("config", "productMappings");
  const pmKeysCount = Object.keys(pmVerified?.mappings || {}).length;
  console.log(`   ✅ config/productMappings gravado com ${pmKeysCount} mapeamentos de produtos!`);

  // 2. Gravar config/vipOverrides
  console.log("⏳ [2/2] Gravando config/vipOverrides...");
  const vipResult = await saveFirestoreDoc("config", "vipOverrides", VIP_OVERRIDES_DATA);
  const vipVerified = await readFirestoreDoc("config", "vipOverrides");
  const vipListCount = (vipVerified?.vipEmails || []).length;
  const adminListCount = (vipVerified?.adminEmails || []).length;
  console.log(`   ✅ config/vipOverrides gravado com ${vipListCount} VIPs e ${adminListCount} administradores!`);

  console.log("\n=================================================================");
  console.log("🏁 CONFIGURAÇÕES EXTERNALIZADAS COM SUCESSO NO FIRESTORE");
  console.log("=================================================================");

  return {
    productMappings: pmVerified,
    vipOverrides: vipVerified
  };
}

if (require.main === module) {
  seedConfigDocs().catch(err => {
    console.error("❌ Erro fatal ao externalizar configurações:", err);
    process.exit(1);
  });
}

module.exports = {
  PRODUCT_MAPPINGS_DATA,
  VIP_OVERRIDES_DATA,
  seedConfigDocs
};
