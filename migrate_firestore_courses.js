async function run() {
  const url = 'https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses';
  const res = await fetch(url + '?pageSize=50');
  const data = await res.json();
  
  const updates = {
    'aef-experience': 'free',
    'airport_flight_level_1': 'standalone',
    'english-quickstart': 'all_access',
    'fs-aef-ec': 'all_access',
    'ms-legacy': 'all_access',
    'dtc_curso': 'free',
    'mentoria-andre': 'standalone'
  };

  for (const doc of data.documents) {
    const id = doc.name.split('/').pop();
    if (updates[id]) {
      const accessTier = updates[id];
      const patchUrl = 'https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses/' + id + '?updateMask.fieldPaths=accessTier';
      
      const payload = {
        fields: {
          accessTier: { stringValue: accessTier }
        }
      };

      console.log('Updating ' + id + ' to ' + accessTier + '...');
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (patchRes.ok) {
        console.log('Successfully updated ' + id + '.');
      } else {
        console.error('Failed to update ' + id + ':', await patchRes.text());
      }
    }
  }
}
run();
