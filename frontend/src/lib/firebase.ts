import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqRP-h35xjCf0jqMZstxB6BdJOKamp8UU",
  authDomain:"debay-93e76.firebaseapp.com",
  projectId: "debay-93e76",
  storageBucket: "debay-93e76.firebasestorage.app",
  messagingSenderId: "468466593830",
  appId: "1:468466593830:web:2be15b45b832d47da576e7"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
