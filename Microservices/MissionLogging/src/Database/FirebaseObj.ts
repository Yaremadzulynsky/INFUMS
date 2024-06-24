import { initializeApp } from "@firebase/app";
import { config } from "dotenv";

config();

const firebaseConfig = process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : {};

export const firebaseApp = initializeApp(firebaseConfig);