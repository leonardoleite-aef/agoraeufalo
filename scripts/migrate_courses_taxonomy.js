/**
 * Script de migração de taxonomia de Cursos (Firestore)
 * Executar via Node.js local (com service account) ou colar no DevTools logado como admin.
 */

// Este script é adaptado para rodar no console do navegador de um Admin logado
// se o ambiente Node não estiver configurado com service account.

async function migrateCoursesTaxonomy() {
  if (!window.aefCloudSync || !window.aefCloudSync.db) {
    console.error("Execute isso na página admin-cursos.html com o aefCloudSync carregado.");
    return;
  }
  
  const db = window.aefCloudSync.db;
  console.log("Iniciando migração de taxonomia de cursos...");
  
  try {
    const coursesSnap = await db.collection("courses").get();
    let updatedCount = 0;
    
    for (const doc of coursesSnap.docs) {
      const data = doc.data();
      const courseId = doc.id;
      
      console.log(`Processando curso: ${courseId}`);
      
      let accessTier = 'all_access'; // default paid catalog
      let categories = ['foundations']; // default category
      
      // Mapeamento legado
      if (data.tierRequired === 'free') {
        accessTier = 'free';
      } else if (data.tierRequired === 'vip' || !data.tierRequired) {
        accessTier = 'all_access';
      }
      
      if (data.availableForPurchase === true) {
        accessTier = 'standalone';
      }
      
      // Se houver algum 'tag' ou identificador que possamos usar para categories:
      if (data.id && data.id.includes('dtc_')) {
        categories = ['foundations'];
      } else if (data.id && data.id.includes('magic')) {
        categories = ['magic_stories'];
      }
      
      // Atualizar o documento
      const firebase = window.firebase;
      
      const payload = {
        accessTier: accessTier,
        categories: categories,
        tierRequired: firebase.firestore.FieldValue.delete(),
        accessCategories: firebase.firestore.FieldValue.delete(),
        availableForPurchase: firebase.firestore.FieldValue.delete()
      };
      
      await db.collection("courses").doc(courseId).update(payload);
      console.log(`✅ Curso ${courseId} atualizado para accessTier=${accessTier}, categories=[${categories.join(',')}]`);
      updatedCount++;
    }
    
    console.log(`🎉 Migração concluída! ${updatedCount} cursos atualizados.`);
  } catch (error) {
    console.error("Erro ao migrar cursos:", error);
  }
}

// Descomente a linha abaixo para executar automaticamente se colado no DevTools
// migrateCoursesTaxonomy();
