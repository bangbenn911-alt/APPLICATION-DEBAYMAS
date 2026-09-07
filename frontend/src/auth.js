import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqRP-h35xjCf0jqMZstxB6BdJOKamp8UU",
  authDomain: "debay-93e76.firebaseapp.com",
  projectId: "debay-93e76",
  storageBucket: "debay-93e76.firebasestorage.app",
  messagingSenderId: "468466593830",
  appId: "1:468466593830:web:2be15b45b832d47da576e7",
  measurementId: "G-4GL81N51M8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert(`Login Berhasil! Selamat datang, ${userCredential.user.email}`);
      window.location.href = "index.html";
    } catch (error) {
      alert(`Gagal Masuk: Periksa kembali email dan password Anda. (${error.code})`);
    }
  });
}
