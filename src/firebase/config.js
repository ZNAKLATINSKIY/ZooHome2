import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBh1VBzUVdhyUh84gGpLoS13w4qL3EhbaE",
    authDomain: "zoohome-6b44b.firebaseapp.com",
    projectId: "zoohome-6b44b",
    storageBucket: "zoohome-6b44b.firebasestorage.app",
    messagingSenderId: "985477045156",
    appId: "1:985477045156:web:86cae3f08969ce679aff31",
    measurementId: "G-M8PRYVLBML"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
