// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  // getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// import { initializeFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeFh4zPEt2t7UEoda8OffgVHbV3rgIE5w",
  authDomain: "talltower-server.firebaseapp.com",
  projectId: "talltower-server",
  storageBucket: "talltower-server.appspot.com",
  messagingSenderId: "717820439765",
  appId: "1:717820439765:web:5c5ae18fa27332ce9a865c",
  measurementId: "G-LJJSY4RNE5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
export const auth = initializeAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
// export const db = initializeFirestore(app, {
//   experimentalForceLongPolling: true,
// });
// const analytics = getAnalytics(app);

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}
