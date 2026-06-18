// Firebase placeholder — Flux Ops AI Copilot está preparado para sustituir
// la fuente CSV por Firestore sin tocar las pantallas.
//
// Para activarlo:
//   1. bun add firebase
//   2. Definir VITE_FIREBASE_* en el entorno
//   3. Implementar fetchCollection() y enrutar desde dataSource.ts

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export const firebaseConfig: Partial<FirebaseConfig> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured =
  !!firebaseConfig.projectId && !!firebaseConfig.apiKey;

// Implementación real (descomentar cuando se instale firebase):
//
// import { initializeApp, getApps } from "firebase/app";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
//
// export const firebaseApp = isFirebaseConfigured
//   ? getApps()[0] ?? initializeApp(firebaseConfig as FirebaseConfig)
//   : null;
// export const db = firebaseApp ? getFirestore(firebaseApp) : null;
//
// export async function fetchCollection<T>(path: string): Promise<T[]> {
//   if (!db) throw new Error("Firebase no está configurado");
//   const snap = await getDocs(collection(db, path));
//   return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
// }