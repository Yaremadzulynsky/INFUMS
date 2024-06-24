import {FirebaseOptions} from "firebase/app";

export let firebaseConfigOptions: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

export const googleMapsApiKey: { googleMapsApiKey: string } = {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
}

interface Rock7Credentials {
    IMEI: string;
    usernameEncoded: string;
    usernameNonEncoded: string;
    password: string;
}

export const rock7Credentials: Rock7Credentials = {
    IMEI: process.env.ROCK7_IMEI || "",
    usernameEncoded: process.env.ROCK7_USERNAME_ENCODED || "",
    usernameNonEncoded: process.env.ROCK7_USERNAME_NON_ENCODED || "",
    password: process.env.ROCK7_PASSWORD || ""
}