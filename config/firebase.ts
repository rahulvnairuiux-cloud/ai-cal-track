import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper function to save user data
export const saveUserToFirestore = async (
    userId: string,
    email: string,
    name: string,
    provider: string
) => {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            userId,
            email,
            name,
            provider,
            createdAt: new Date(),
        }, { merge: true }); // Merge ensures we don't overwrite if it exists and we're just signing in
        console.log('User data saved to Firestore');
    } catch (error) {
        console.error('Error saving user to Firestore: ', error);
    }
};
