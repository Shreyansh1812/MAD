// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDAN8CSKhavsKa2F-X7mmypBuEmiXG7ec8",
  authDomain: "quickmenu-mad.firebaseapp.com",
  projectId: "quickmenu-mad",
  storageBucket: "quickmenu-mad.firebasestorage.app",
  messagingSenderId: "242106387505",
  appId: "1:242106387505:web:4f215cf7c48b2dba695910",
  measurementId: "G-6N98HTK24Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider for native-style Google Sign-In
export const googleProvider = new GoogleAuthProvider();
