// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAuth } from "firebase/auth"; // Import Authentication if needed

// Configuración de la primera base de datos (la ya existente)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Configuración de la segunda base de datos (nueva configuración)
const secondFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_SECOND_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_SECOND_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_SECOND_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_SECOND_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_SECOND_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_SECOND_FIREBASE_APP_ID,
};

// Inicializar la primera instancia de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Inicializar la segunda instancia de Firebase
const secondApp = initializeApp(secondFirebaseConfig, "secondApp");
const secondDb = getFirestore(secondApp);
const secondAuth = getAuth(secondApp);

// Exportar las instancias de Firebase
export { app, db, analytics, auth, secondApp, secondDb, secondAuth };
