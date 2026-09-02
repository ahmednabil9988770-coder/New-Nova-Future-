import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMFwMsOfykKRek82HQsdae9czwIxtEZWg",
    authDomain: "new-nova-future.firebaseapp.com",
    projectId: "new-nova-future",
    storageBucket: "new-nova-future.firebasestorage.app",
    messagingSenderId: "101150557975",
    appId: "1:101150557975:web:ac0786d4238bb30ab11952"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
