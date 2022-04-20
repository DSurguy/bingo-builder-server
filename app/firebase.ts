import { FirebaseApp, initializeApp } from "firebase/app";

let firebasePromise: Promise<FirebaseApp> | null = null;

const getFirebaseApp = (): Promise<FirebaseApp> => {
  if( !firebasePromise ) {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    firebasePromise = new Promise<FirebaseApp>((resolve, reject) => {
      try {
        console.log(firebaseConfig.apiKey);
        const app = initializeApp(firebaseConfig);
        resolve(app);
      } catch (e) {
        console.error("Failed to initialize firebase app", e);
        reject(e);
      }
    });
  }

  return firebasePromise;
}

export default getFirebaseApp;