import { initializeApp, cert } from 'firebase-admin/app';

let firebasePromise: Promise<any> | null = null;

const getFirebaseService = (): Promise<any> => {
  if( !firebasePromise ) {
    firebasePromise = new Promise<any>((resolve, reject) => {
      try {
        if( !process.env.GOOGLE_APPLICATION_CREDENTIALS ) throw new Error("Path to SDK key not found");
        const app = initializeApp({
          credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        });
        resolve(app);
      } catch (e) {
        console.error("Failed to initialize firebase SDK", e);
        reject(e);
      }
    });
  }

  return firebasePromise;
}

export default getFirebaseService;