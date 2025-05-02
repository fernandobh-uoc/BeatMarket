import { FIREBASE_AUTH_TOKEN } from "src/app/core/services/auth/adapters/firebase-auth.adapter";
import { FIREBASE_FIRESTORE_TOKENS } from "src/app/core/services/storage/adapters/firebase-firestore.adapter";
import { FIREBASE_CLOUD_STORAGE_TOKEN } from "src/app/core/services/cloud-storage/adapters/firebase-cloudStorage.adapter";

export const environment = {
  production: false,
  authToken: FIREBASE_AUTH_TOKEN,
  storageTokens: FIREBASE_FIRESTORE_TOKENS,
  cloudStorageToken: FIREBASE_CLOUD_STORAGE_TOKEN,
  firebase: {
    apiKey: "AIzaSyAVCQrk9BinjVxO-eEHD4gKwb6UMOahJso",
    authDomain: "beatmarket-uoc.firebaseapp.com",
    projectId: "beatmarket-uoc",
    storageBucket: "beatmarket-uoc.firebasestorage.app",
    messagingSenderId: "61948068505",
    appId: "1:61948068505:web:39e9c0e8f5f7d4c56aee08"
  }
};