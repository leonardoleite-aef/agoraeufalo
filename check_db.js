async function run() {
  const url = 'https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses?pageSize=50';
  const res = await fetch(url);
  const data = await res.json();
  data.documents.forEach(doc => {
    const fields = doc.fields || {};
    const id = doc.name.split('/').pop();
    const tierRequired = fields.tierRequired?.stringValue || 'N/A';
    const accessTier = fields.accessTier?.stringValue || 'N/A';
    const title = fields.title?.stringValue || 'N/A';
    console.log(`${id.padEnd(25)} | tierRequired=${tierRequired.padEnd(15)} | accessTier=${accessTier.padEnd(12)} | ${title}`);
  });
}
run();
