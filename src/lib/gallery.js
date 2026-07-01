import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc as firestoreDoc, updateDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0OW6erjbFmAPBiMptLILRpDgmvCe4KHs",
  authDomain: "risopaint.firebaseapp.com",
  projectId: "risopaint",
  storageBucket: "risopaint.firebasestorage.app",
  messagingSenderId: "580697998993",
  appId: "1:580697998993:web:1928e0f8456c6c1dd36130"
};

let db = null;

export function initGallery(config) {
  try {
    const app = initializeApp(config || firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.warn('Gallery: Firebase init failed', e);
  }
}

export async function submitToGallery(canvasEl, name, message) {
  if (!db) {
    console.error('Gallery: db not initialized');
    throw new Error('db not initialized');
  }

  // Resize to max 800px wide for Firestore size limits
  const maxW = 800;
  const scale = Math.min(1, maxW / canvasEl.width);
  const w = Math.floor(canvasEl.width * scale);
  const h = Math.floor(canvasEl.height * scale);
  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const ctx = tmp.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(canvasEl, 0, 0, w, h);
  const imageData = tmp.toDataURL('image/jpeg', 0.8);

  const doc = await addDoc(collection(db, 'gallery'), {
    name: name || 'anonymous',
    message: message || '',
    image: imageData,
    createdAt: serverTimestamp(),
  });

  return doc.id;
}

export async function getGalleryItems(count = 50) {
  if (!db) return [];

  const q = query(
    collection(db, 'gallery'),
    orderBy('createdAt', 'desc'),
    limit(count)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function fixBlackBackgrounds() {
  if (!db) { console.error('db not initialized'); return; }

  const items = await getGalleryItems(100);
  let fixed = 0;

  for (const item of items) {
    if (!item.image) continue;

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = item.image;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let blackPixels = 0;
    const total = canvas.width * canvas.height;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 15 && data[i + 1] < 15 && data[i + 2] < 15) {
        blackPixels++;
      }
    }

    const blackRatio = blackPixels / total;
    if (blackRatio < 0.1) continue;

    console.log(`Fixing "${item.name}" (${item.id}) — ${Math.round(blackRatio * 100)}% black pixels`);

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 15 && data[i + 1] < 15 && data[i + 2] < 15) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const newDataUrl = canvas.toDataURL('image/jpeg', 0.8);

    const docRef = firestoreDoc(db, 'gallery', item.id);
    await updateDoc(docRef, { image: newDataUrl });
    fixed++;
    console.log(`  ✓ updated`);
  }

  console.log(`Done — fixed ${fixed} image(s)`);
}
