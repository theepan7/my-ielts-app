// src/firebase/config.js
// Firebase is initialized here using environment variables.
// Never commit your real .env file — only .env.example goes to GitHub.

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBdfo2m9fdCNvx8e0pPgX3H-UD7b90QwH0",
  authDomain: "listeninghub-50d02.firebaseapp.com",
  projectId: "listeninghub-50d02",
  storageBucket: "listeninghub-50d02.firebasestorage.app",
  messagingSenderId: "240024230551",
  appId: "1:240024230551:web:e8ba492834e1a3fcd7a7d2"
};

const app = initializeApp(firebaseConfig)

export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)
export default app
