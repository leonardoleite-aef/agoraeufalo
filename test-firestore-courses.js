const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('/Users/macbookpro/Desktop/agoraeufalo_site/service-account.json'))
});
const db = admin.firestore();

async function run() {
  const courseDoc = await db.collection('courses').doc('ms-legacy').get();
  console.log("Course exists:", courseDoc.exists);
  if (courseDoc.exists) {
    const modulesSnapshot = await db.collection('courses').doc('ms-legacy').collection('modules').get();
    console.log("Modules count:", modulesSnapshot.size);
    for (const modDoc of modulesSnapshot.docs) {
      console.log(`Module: ${modDoc.id} - ${modDoc.data().title}`);
      const lessonsSnapshot = await db.collection('courses').doc('ms-legacy').collection('modules').doc(modDoc.id).collection('lessons').get();
      console.log(`  Lessons count: ${lessonsSnapshot.size}`);
      for (const lessonDoc of lessonsSnapshot.docs) {
        console.log(`    Lesson: ${lessonDoc.id} - ${lessonDoc.data().title}`);
      }
    }
  }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
