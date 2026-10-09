require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { execSync } = require('child_process');

const PROJECT_ID = 'agoraeufalo-3463a';
const BUCKET = 'aef-course-content';

// R2 credentials
const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error("Missing R2 credentials in environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
    process.exit(1);
}

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

// Authenticate Firebase Admin SDK using firebase-tools refresh token
console.log('Authenticating Firebase Admin SDK via firebase-tools...');
const configPath = path.join(process.env.HOME, '.config/configstore/firebase-tools.json');
if (!fs.existsSync(configPath)) {
    console.error("Firebase tools config not found. Please run 'npx firebase-tools login' first.");
    process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = config.tokens.refresh_token;

const tempCredPath = path.resolve('.temp_adc_credentials.json');
const credObj = {
    type: "authorized_user",
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    refresh_token: refreshToken
};
fs.writeFileSync(tempCredPath, JSON.stringify(credObj));
process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredPath;

let db;
try {
    initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID
    });
    db = getFirestore();
} catch (e) {
    console.error("Firebase Admin initialization failed.");
    console.error(e);
    if (fs.existsSync(tempCredPath)) fs.unlinkSync(tempCredPath);
    process.exit(1);
}

const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.mp4': return 'video/mp4';
        case '.mp3': return 'audio/mpeg';
        case '.pdf': return 'application/pdf';
        default: return 'application/octet-stream';
    }
};

async function uploadStreamToR2(url, r2Key, mimeType) {
    const res = await fetch(url);
    if (!res.ok) {
        if (res.status === 404) {
            console.log(`[${r2Key}] 404 NOT FOUND on Firebase. Skipping.`);
            return false;
        }
        throw new Error(`HTTP ${res.status} from Firebase`);
    }
    
    try {
        const checkRes = await fetch(`https://assets.agoraeufalo.com.br/${r2Key}`, { method: 'HEAD' });
        if (checkRes.status === 200) {
            console.log(`Already on R2: ${r2Key}`);
            return true;
        }
    } catch(e) {}

    console.log(`[${r2Key}] Starting Multipart Upload to R2...`);
    const upload = new Upload({
        client: s3,
        params: {
            Bucket: BUCKET,
            Key: r2Key,
            Body: res.body,
            ContentType: mimeType,
            CacheControl: "public, max-age=31536000"
        },
        partSize: 15 * 1024 * 1024, // 15 MB
        queueSize: 4
    });

    upload.on("httpUploadProgress", (progress) => {
        console.log(`[${r2Key}] Uploaded part ${progress.part} / ${progress.loaded} bytes`);
    });

    await upload.done();
    return true;
}

function extractFirebaseUrls(data, urlsSet) {
    if (typeof data === 'string') {
        if (data.includes('https://firebasestorage.googleapis.com')) {
            const matches = data.match(/https:\/\/firebasestorage\.googleapis\.com[^"\\\s]*/g) || [];
            matches.forEach(m => urlsSet.add(m));
        }
    } else if (Array.isArray(data)) {
        data.forEach(item => extractFirebaseUrls(item, urlsSet));
    } else if (data !== null && typeof data === 'object') {
        for (const [k, v] of Object.entries(data)) {
            if (typeof v === 'string' && v.includes('https://firebasestorage.googleapis.com')) {
                try {
                    const parsed = JSON.parse(v);
                    if (parsed && typeof parsed === 'object') {
                        extractFirebaseUrls(parsed, urlsSet);
                        continue;
                    }
                } catch (e) {}
            }
            extractFirebaseUrls(v, urlsSet);
        }
    }
}

function structuredPatch(data, oldUrl, newUrl) {
    let modified = false;
    if (typeof data === 'string') {
        if (data === oldUrl) return { modified: true, data: newUrl };
        if (data.includes(oldUrl)) return { modified: true, data: data.split(oldUrl).join(newUrl) };
        return { modified: false, data };
    }
    if (Array.isArray(data)) {
        const newArr = [];
        for (const item of data) {
            const res = structuredPatch(item, oldUrl, newUrl);
            if (res.modified) modified = true;
            newArr.push(res.data);
        }
        return { modified, data: newArr };
    }
    if (data !== null && typeof data === 'object') {
        const newObj = {};
        for (const [k, v] of Object.entries(data)) {
            if (typeof v === 'string' && v.includes(oldUrl)) {
                try {
                    const parsed = JSON.parse(v);
                    if (parsed && typeof parsed === 'object') {
                        const res = structuredPatch(parsed, oldUrl, newUrl);
                        if (res.modified) {
                            modified = true;
                            newObj[k] = JSON.stringify(res.data);
                            continue;
                        }
                    }
                } catch(e) {}
            }
            const res = structuredPatch(v, oldUrl, newUrl);
            if (res.modified) modified = true;
            newObj[k] = res.data;
        }
        return { modified, data: newObj };
    }
    return { modified: false, data };
}

async function collectAllDocuments(collectionName, allDocs) {
    const snapshot = await db.collection(collectionName).get();
    for (const doc of snapshot.docs) {
        allDocs.push({ ref: doc.ref, data: doc.data() });
    }
    
    if (collectionName === 'courses') {
        for (const doc of snapshot.docs) {
            await collectAllDocuments(`${doc.ref.path}/modules`, allDocs);
        }
    }
    if (collectionName.endsWith('/modules')) {
        for (const doc of snapshot.docs) {
            await collectAllDocuments(`${doc.ref.path}/lessons`, allDocs);
        }
    }
}

async function run() {
    console.log('--- STARTING S3 MIGRATION VIA MULTIPART STREAM ---');
    console.log('Fetching live Firestore data dynamically...');
    
    const allDocs = [];
    await collectAllDocuments('courses', allDocs);
    console.log(`Fetched ${allDocs.length} total documents (courses + modules + lessons).`);

    const firebaseUrlsSet = new Set();
    for (const doc of allDocs) {
        extractFirebaseUrls(doc.data, firebaseUrlsSet);
    }
    
    const uniqueFbUrls = Array.from(firebaseUrlsSet);
    console.log(`Found ${uniqueFbUrls.length} residual Firebase URLs dynamically.`);

    const mapping = [];
    for (const fbUrl of uniqueFbUrls) {
        try {
            const urlObj = new URL(fbUrl);
            const pathParts = urlObj.pathname.split('/o/');
            if (pathParts.length < 2) continue;
            
            const r2Key = decodeURIComponent(pathParts[1].split('?')[0]);
            const r2Url = `https://assets.agoraeufalo.com.br/${r2Key}`;
            
            console.log(`\nProcessing: ${r2Key}`);
            const success = await uploadStreamToR2(fbUrl, r2Key, getMimeType(r2Key));
            
            if (success) {
                mapping.push({ old: fbUrl, new: r2Url });
            }
        } catch (e) {
            console.error(`Failed to migrate ${fbUrl}: ${e.message}`);
        }
    }

    if (mapping.length > 0) {
        console.log('\nPatching Firestore documents... (using structured PATCH)');
        let patchedCount = 0;
        
        for (const docObj of allDocs) {
            let currentData = docObj.data;
            let documentModified = false;
            
            for (const m of mapping) {
                const res = structuredPatch(currentData, m.old, m.new);
                if (res.modified) {
                    currentData = res.data;
                    documentModified = true;
                }
            }
            
            if (documentModified) {
                console.log(`Patching Firestore document: ${docObj.ref.path}`);
                await docObj.ref.set(currentData);
                patchedCount++;
            }
        }
        console.log(`Successfully patched ${patchedCount} documents in Firestore.`);

        console.log('\nPatching frontend registries...');
        const frontendFiles = ['assets/js/aef-courses-registry.js', 'assets/js/aef-courses-metadata.js', 'assets/js/aef-offers-registry.js'];
        for (const f of frontendFiles) {
            if (fs.existsSync(f)) {
                let content = fs.readFileSync(f, 'utf8');
                for (const m of mapping) {
                    content = content.split(m.old).join(m.new);
                }
                fs.writeFileSync(f, content);
                console.log(`Patched ${f}`);
            }
        }

        console.log('\nBuilding and pushing to git...');
        try {
            execSync('npm run build', { stdio: 'inherit' });
            execSync('git add assets/js/', { stdio: 'inherit' });
            execSync('git commit -m "fix: migrate final large files to R2 via S3 Multipart Upload and Structured Patch"', { stdio: 'inherit' });
            execSync('git push origin main', { stdio: 'inherit' });
            console.log('Git commit and push successful.');
        } catch (e) {
            console.log(`Git/Build error: ${e.message}`);
        }
    } else {
        console.log("\nNo files migrated successfully. Nothing to patch.");
    }

    // Cleanup ADC temp file
    if (fs.existsSync(tempCredPath)) {
        fs.unlinkSync(tempCredPath);
    }
    console.log('\n--- S3 MIGRATION COMPLETE ---');
}

run().catch(e => {
    console.error(e);
    if (fs.existsSync(tempCredPath)) fs.unlinkSync(tempCredPath);
});
