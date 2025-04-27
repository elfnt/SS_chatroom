// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD5fyWrQbUENutIy9AIaPmbLmRfLVXLNwg",
    authDomain: "ss-chatroo.firebaseapp.com",
    projectId: "ss-chatroo",
    storageBucket: "ss-chatroo.appspot.com", 
    messagingSenderId: "719294623236",
    appId: "1:719294623236:web:b6f15d10fd580a4f750f51",
    measurementId: "G-CLL9HV09ES"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };