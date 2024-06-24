import {FirebaseOptions} from "firebase/app";


/**
 * Firebase configuration options
 * @type {FirebaseOptions} - Firebase configuration options
 * @property {string} apiKey - Firebase API key
 * @property {string} authDomain - Firebase auth domain
 * @property {string} databaseURL - Firebase database URL
 * @property {string} projectId - Firebase project ID
 * @property {string} storageBucket - Firebase storage bucket
 * @property {string} messagingSenderId - Firebase messaging sender ID
 * @property {string} appId - Firebase app ID
 */
export const firebaseConfigOptions: FirebaseOptions = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
}

/**
 * Google Maps API key
 * @type {string} - Google Maps API key
 */
export const googleMapsApiKey: { googleMapsApiKey: string } = {
        googleMapsApiKey: "",
}


/**
 * Rock7 credentials
 * @type {Rock7Credentials} - Rock7 credentials
 * @property {string} usernameEncoded - Rock7 username with a %40 instead of @
 * @property {string} usernameNonEncoded - Rock7 username with no substitutions
 * @property {string} password - Rock7 password
 */
interface Rock7Credentials {
    IMEI: string;
    usernameEncoded: string;
    usernameNonEncoded: string;
    password: string;
}

export const rock7Credentials: Rock7Credentials = {
    IMEI: "",
    usernameEncoded: "",
    usernameNonEncoded: "",
    password: ""
}

export const sendMessageURL = (sendString: string) => {
    return ``
}
