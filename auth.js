import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyC4wbkceT_vAWdBpYs7KhBQxjgkiDvyG9c",
  authDomain: "red-empire-103d7.firebaseapp.com",
  databaseURL: "https://red-empire-103d7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "red-empire-103d7",
  storageBucket: "red-empire-103d7.firebasestorage.app",
  messagingSenderId: "1002924043244",
  appId: "1:1002924043244:web:e76002c3dc8810017faec9",
  measurementId: "G-DPG3ZZ68G4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// --- CONNEXION ---
window.login = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `users/${user.uid}`));
        
        if (!snapshot.exists()) {
            await set(ref(db, 'users/' + user.uid), {
                username: user.displayName,
                avatar: user.photoURL,
                email: user.email,
                joinedAt: new Date().toISOString(),
                stats: { wakfudle: { wins: 0 }, haikyuudle: { wins: 0 } }
            });
        }
    } catch (error) { alert(error.message); }
};

window.logout = async () => {
    await signOut(auth);
    window.location.href = "index.html";
};

// --- GESTION IMAGE DEPUIS PC (NOUVEAU) ---
window.handleImageUpload = (input) => {
    const file = input.files[0];
    if (!file) return;

    // Sécurité : Limite de taille (500ko) pour ne pas saturer la Realtime DB
    if (file.size > 500 * 1024) {
        alert("⚠️ Image trop volumineuse !\nLa taille maximum est de 500ko.\nEssayez de compresser l'image ou d'utiliser un lien URL.");
        input.value = ""; // Reset
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        // On met l'image convertie en Base64 dans l'aperçu et dans le champ URL caché
        const base64String = e.target.result;
        document.getElementById('current-avatar').src = base64String;
        document.getElementById('input-avatar-url').value = base64String;
    };
    reader.readAsDataURL(file);
};

// --- SAUVEGARDE DU PROFIL ---
window.saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newName = document.getElementById('input-username').value;
    const newAvatar = document.getElementById('input-avatar-url').value;
    const newPassword = document.getElementById('input-password').value;

    try {
        // 1. Mise à jour des infos dans la DB
        const updates = {};
        updates[`users/${user.uid}/username`] = newName;
        updates[`users/${user.uid}/avatar`] = newAvatar;
        await update(ref(db), updates);

        // 2. Mise à jour du mot de passe (Seulement si rempli)
        if (newPassword && newPassword.length > 0) {
            // Vérification si c'est un compte Google
            if (user.providerData[0].providerId === 'google.com') {
                alert("⚠️ Impossible de changer le mot de passe.\n\nVous êtes connecté via Google. Votre mot de passe est géré par Google directement.");
            } else {
                await updatePassword(user, newPassword);
                alert("✅ Profil et mot de passe mis à jour !");
            }
        } else {
            alert("✅ Profil mis à jour !");
        }

        // Rafraichissement visuel
        updateUI(user);
        
    } catch (e) {
        console.error(e);
        // Gestion des erreurs spécifiques (ex: mot de passe trop court)
        if(e.code === 'auth/requires-recent-login') {
            alert("Pour changer le mot de passe, vous devez vous reconnecter récemment. Déconnectez-vous et réessayez.");
        } else {
            alert("Erreur : " + e.message);
        }
    }
};

// --- CHARGER LES DONNÉES ---
async function loadProfileFormData(user) {
    const inputName = document.getElementById('input-username');
    const inputAvatar = document.getElementById('input-avatar-url');
    const imgPreview = document.getElementById('current-avatar');
    const uidDisplay = document.getElementById('user-uid');

    if (inputName && inputAvatar) {
        try {
            const snapshot = await get(child(ref(db), `users/${user.uid}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                inputName.value = data.username || user.displayName;
                // Si l'avatar est très long (Base64), on le met quand même dans la value
                inputAvatar.value = data.avatar || user.photoURL;
                if(imgPreview) imgPreview.src = data.avatar || user.photoURL;
                if(uidDisplay) uidDisplay.innerText = user.uid.substring(0, 8) + "...";
            }
        } catch (e) { console.error(e); }
    }
}

// --- GESTION JEUX ---
window.saveGameWin = async (gameName, attempts) => {
    const user = auth.currentUser;
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const path = `users/${user.uid}/stats/${gameName}`;
    try {
        const snap = await get(child(ref(db), path));
        let stats = snap.val() || { wins: 0, streak: 0 };
        const updates = {};
        updates[path + '/wins'] = (stats.wins || 0) + 1;
        updates[path + '/streak'] = (stats.streak || 0) + 1;
        updates[path + '/lastPlayed'] = today;
        const newKey = push(child(ref(db), path + '/history')).key;
        updates[path + '/history/' + newKey] = { date: today, attempts: attempts };
        await update(ref(db), updates);
    } catch (e) { console.error(e); }
};

// --- UI UPDATE GLOBAL ---
async function updateUI(user) {
    const loginBtn = document.getElementById('btn-login');
    const userProfile = document.getElementById('user-profile'); // Le lien vers profile.html
    const displayName = document.getElementById('display-name');
    const profilePic = document.getElementById('profile-pic');

    if (user) {
        if(loginBtn) loginBtn.classList.add('hidden');
        if(userProfile) userProfile.classList.remove('hidden');
        
        try {
            const snapshot = await get(child(ref(db), `users/${user.uid}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                if(displayName) displayName.innerText = data.username;
                if(profilePic) profilePic.src = data.avatar;
            } else {
                if(displayName) displayName.innerText = user.displayName;
                if(profilePic) profilePic.src = user.photoURL;
            }
        } catch(e) { console.error(e); }

        loadProfileFormData(user);
        
    } else {
        if(loginBtn) loginBtn.classList.remove('hidden');
        if(userProfile) userProfile.classList.add('hidden');
        
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = 'index.html';
        }
    }
}

onAuthStateChanged(auth, (user) => updateUI(user));
