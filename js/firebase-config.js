// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUQy3sghHxrHTfvg5NHGlRAaspbdrvP_E",
  authDomain: "berkay-yuklu.firebaseapp.com",
  projectId: "berkay-yuklu",
  storageBucket: "berkay-yuklu.firebasestorage.app",
  messagingSenderId: "842544285684",
  appId: "1:842544285684:web:cb83f8a90b413cee70dba1",
  measurementId: "G-1MTEX3VPXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Admin e-postası
const ADMIN_EMAIL = "yukluberkay@gmail.com";

// Mevcut kullanıcıyı takip et
let currentUser = null;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  updateAuthUI(user);
  if (user) {
    await ensureUserProfile(user);
  }
});

async function ensureUserProfile(user) {
  const userRef = db.collection("users").doc(user.uid);
  const doc = await userRef.get();
  if (!doc.exists) {
    await userRef.set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL || null,
      isAdmin: user.email === ADMIN_EMAIL,
      isSubscribed: false,
      subscriptionPlan: null,
      subscriptionExpiry: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    // Admin kontrolü güncelle
    if (user.email === ADMIN_EMAIL && !doc.data().isAdmin) {
      await userRef.update({ isAdmin: true });
    }
  }
}

function updateAuthUI(user) {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const userMenu = document.getElementById("userMenu");
  const userAvatar = document.getElementById("userAvatar");
  const userDisplayName = document.getElementById("userDisplayName");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (userMenu) userMenu.style.display = "flex";
    if (userAvatar) {
      userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=c8963e&color=fff`;
    }
    if (userDisplayName) {
      userDisplayName.textContent = user.displayName || user.email.split("@")[0];
    }
    // Admin panel linkini göster
    const adminLink = document.getElementById("adminLink");
    if (adminLink) {
      adminLink.style.display = user.email === ADMIN_EMAIL ? "block" : "none";
    }
  } else {
    if (loginBtn) loginBtn.style.display = "inline-flex";
    if (registerBtn) registerBtn.style.display = "inline-flex";
    if (userMenu) userMenu.style.display = "none";
  }
}

// Google ile giriş
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    closeModal("authModal");
    showToast("Başarıyla giriş yapıldı!", "success");
  } catch (e) {
    showToast("Google ile giriş başarısız: " + e.message, "error");
  }
}

// Facebook ile giriş
async function signInWithFacebook() {
  const provider = new firebase.auth.FacebookAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    closeModal("authModal");
    showToast("Başarıyla giriş yapıldı!", "success");
  } catch (e) {
    showToast("Facebook ile giriş başarısız: " + e.message, "error");
  }
}

// E-posta ile kayıt
async function registerWithEmail(email, password, displayName) {
  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName });
    closeModal("authModal");
    showToast("Hesabınız oluşturuldu!", "success");
  } catch (e) {
    showToast("Kayıt başarısız: " + e.message, "error");
  }
}

// E-posta ile giriş
async function loginWithEmail(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    closeModal("authModal");
    showToast("Hoş geldiniz!", "success");
  } catch (e) {
    showToast("Giriş başarısız: " + e.message, "error");
  }
}

// Çıkış
async function signOut() {
  await auth.signOut();
  showToast("Çıkış yapıldı.", "info");
  if (window.location.pathname.includes("admin") || window.location.pathname.includes("profile")) {
    window.location.href = "index.html";
  }
}

// Yardımcı fonksiyonlar
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}
