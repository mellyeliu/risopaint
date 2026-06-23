import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

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
  if (!db) return null;

  // Convert canvas to a data URL (compressed JPEG for size)
  const imageData = canvasEl.toDataURL('image/jpeg', 0.7);

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
