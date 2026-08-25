/**
 * AgoraEuFalo - Firestore Seed Script
 * Migrates all local student tracks and playlists directly to Google Cloud Firestore.
 */
const https = require('https');
const fs = require('fs');
const vm = require('vm');

const PROJECT_ID = 'agoraeufalo-3463a';
const API_KEY = 'AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk';

// Mock window environment to load student JS files
global.window = {};
global.navigator = {};
global.localStorage = { getItem: () => null, setItem: () => {} };

function loadStudent(filePath, windowKey) {
  if (!fs.existsSync(filePath)) return null;
  const code = fs.readFileSync(filePath, 'utf8');
  vm.runInThisContext(code);
  return global.window[windowKey] || null;
}

function convertValueToFirestore(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(convertValueToFirestore) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = convertValueToFirestore(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function writeFirestoreDoc(collection, docId, data) {
  return new Promise((resolve, reject) => {
    const fields = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) fields[k] = convertValueToFirestore(v);
    }

    const payload = JSON.stringify({ fields });
    const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${API_KEY}`;

    const req = https.request({
      hostname: 'firestore.googleapis.com',
      path: path,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Saved ${collection}/${docId}`);
          resolve(true);
        } else {
          console.error(`❌ Error saving ${collection}/${docId} (${res.statusCode}):`, body);
          resolve(false);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function seedAll() {
  console.log('🚀 Seeding AgoraEuFalo Database on Google Cloud Firestore...');

  const students = [
    { data: loadStudent('treino/data/thomas.js', 'AEF_STUDENT_THOMAS'), id: 'thomas' },
    { data: loadStudent('treino/data/estevao.js', 'AEF_STUDENT_ESTEVAO'), id: 'estevao' },
    { data: loadStudent('treino/data/andre.js', 'AEF_STUDENT_ANDRE'), id: 'andre' },
    { data: loadStudent('treino/data/matheus.js', 'AEF_STUDENT_MATHEUS'), id: 'matheus' }
  ];

  for (const s of students) {
    if (!s.data) continue;
    console.log(`\n📦 Migrating student: ${s.data.name} (${s.id})`);
    
    // Save main student doc
    await writeFirestoreDoc('students', s.id, {
      id: s.data.id,
      name: s.data.name,
      badge: s.data.badge || 'VIP Mentee',
      tier: 'mentorship_vip',
      status: 'active',
      updatedAt: new Date().toISOString()
    });

    // Save each track as a doc in students/{id}/tracks
    if (s.data.tracks) {
      for (const track of s.data.tracks) {
        const trackDocId = track.id || `track_${Date.now()}`;
        await writeFirestoreDoc(`students/${s.id}/tracks`, trackDocId, {
          id: trackDocId,
          title: track.title,
          duration: track.duration || '00:30',
          coverImage: track.coverImage || '../assets/images/cover-office-logistics.jpg',
          audioUrl: track.audioUrl,
          summary: track.summary || '',
          goldenTip: track.goldenTip || '',
          sentences: track.sentences || [],
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  console.log('\n🎉 ALL STUDENTS AND TRACKS SUCCESSFULLY SEEDED TO FIRESTORE!');
}

seedAll().catch(console.error);
