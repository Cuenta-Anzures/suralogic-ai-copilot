// Firebase placeholder — la app está preparada para conectar a Firebase
// cuando Flux Ops empiece a alimentar los datos operativos.
//
// Para activarlo:
// 1. bun add firebase
// 2. Definir las variables VITE_FIREBASE_* en el entorno
// 3. Cambiar VITE_DATA_SOURCE=firebase
//
// Mientras tanto, dataSource.ts cae al mock local sin romper la UI.

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

// Implementación real (descomenta cuando instales firebase):
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