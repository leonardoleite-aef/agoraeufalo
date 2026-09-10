const fs = require('fs');

/**
 * MIGRATION SCRIPT - Tiers para Categorias
 * Para rodar via Node.js localmente no servidor ou ambiente de deploy.
 * 
 * Necessita do SDK Admin do Firebase.
 * node migrate_tiers_to_categories.js
 */

// NOTA: Requer firebase-admin configurado com credenciais de serviço.
// Exemplo (descomente e configure para rodar):
// const admin = require('firebase-admin');
// const serviceAccount = require('./firebase-service-account.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// const db = admin.firestore();

const MEMBER_CATEGORIES = {
  FREE:      "member_free",
  PAGO:      "member_pago",
  MENTORIA:  "member_mentoria",
  LEGADO_1:  "legado_1",
  LEGADO_2:  "legado_2"
};

function migrateTierToCategories(tier, role, category) {
  const cats = [MEMBER_CATEGORIES.FREE];

  if (role === "admin" || tier === "admin_master") {
    return cats;
  }

  switch (tier) {
    case "vip_mentorship":
    case "vip":
      cats.push(MEMBER_CATEGORIES.PAGO, MEMBER_CATEGORIES.MENTORIA);
      break;

    case "club_annual":
    case "club_anual":
    case "club_monthly":
    case "pro":
    case "course_member":
    case "lifetime":
      cats.push(MEMBER_CATEGORIES.PAGO);
      break;

    case "ms_legacy":
      cats.push(MEMBER_CATEGORIES.LEGADO_1);
      break;

    case "primeiro_legado":
    case "legacy_member":
      cats.push(MEMBER_CATEGORIES.LEGADO_2);
      break;
  }

  if (category === "magic_stories_legacy" && !cats.includes(MEMBER_CATEGORIES.LEGADO_1)) cats.push(MEMBER_CATEGORIES.LEGADO_1);
  if (category === "primeiro_legado_agoraeufalo" && !cats.includes(MEMBER_CATEGORIES.LEGADO_2)) cats.push(MEMBER_CATEGORIES.LEGADO_2);

  return cats;
}

function getBillingPeriod(tier) {
  if (tier === "club_monthly") return "monthly";
  if (tier === "lifetime") return "lifetime";
  return "annual"; // Default
}

async function runMigration() {
  console.log("Iniciando migração de Tiers para Categorias...");
  /*
  const snapshot = await db.collection('users').get();
  
  let count = 0;
  let batch = db.batch();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Ignora se já migrado
    if (Array.isArray(data.categories) && data.categories.length > 0) continue;
    
    const newCategories = migrateTierToCategories(data.tier, data.role, data.category);
    const updates = {
      categories: newCategories,
      purchasedProducts: data.enrolledProducts || []
    };
    
    if (newCategories.includes(MEMBER_CATEGORIES.PAGO)) {
       const subState = data.subscriptionState || {};
       updates.subscription = {
         billingPeriod: getBillingPeriod(data.tier),
         status: subState.status || "active",
         expiresAt: subState.expiresAt || null,
         graceUntil: subState.graceUntil || null,
         gateway: "hotmart",
         lastEvent: subState.lastEvent || "MIGRATION"
       };
    }
    
    batch.update(doc.ref, updates);
    count++;
    
    // Commit a cada 500 para respeitar limite do Firestore
    if (count % 500 === 0) {
      await batch.commit();
      batch = db.batch();
      console.log(`Migrados ${count} usuários...`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Migração completa. ${count} usuários processados.`);
  */
  console.log("Mock script pronto. Descomente e forneça credenciais admin para executar via CLI no Firestore de produção.");
}

runMigration();
