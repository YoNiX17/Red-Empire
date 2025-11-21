// Import des fonctions Firebase (Version CDN pour fonctionner sans installation)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ============================================================
// 🔴 VOTRE CONFIGURATION (C'est ici que j'ai mis vos infos)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyC4wbkceT_vAWdBpYs7KhBQxjgkiDvyG9c",
  authDomain: "red-empire-103d7.firebaseapp.com",
  // L'URL de votre base de données (Europe West 1)
  databaseURL: "https://red-empire-103d7-default-rtdb.europe-west1.firebasedatabase.app", 
  projectId: "red-empire-103d7",
  storageBucket: "red-empire-103d7.firebasestorage.app",
  messagingSenderId: "1002924043244",
  appId: "1:1002924043244:web:e76002c3dc8810017faec9",
  measurementId: "G-DPG3ZZ68G4"
};

// Initialisation de Firebase avec votre config
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // Connexion à la Realtime Database
const provider = new GoogleAuthProvider();

// ============================================================
// 🛠️ SYSTÈME DE GESTION UTILISATEUR
// ============================================================

// 1. Fonction de Connexion (Google)
window.login = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("✅ Connecté :", user.displayName);
        
        // Vérifier si l'utilisateur existe déjà dans la base de données
        const dbRef = ref(db);
        const userSnapshot = await get(child(dbRef, `users/${user.uid}`));
        
        if (!userSnapshot.exists()) {
            // Si c'est sa première fois, on crée son profil
            console.log("🆕 Nouvel utilisateur ! Création du profil...");
            await set(ref(db, 'users/' + user.uid), {
                username: user.displayName,
                email: user.email,
                joinedAt: new Date().toISOString(),
                stats: {
                    wakfudle: { wins: 0, streak: 0 },
                    haikyuudle: { wins: 0, streak: 0 }
                }
            });
        }
        updateUI(user);
    } catch (error) {
        console.error("❌ Erreur connexion:", error);
        alert("Erreur lors de la connexion : " + error.message);
    }
};

// 2. Fonction de Déconnexion
window.logout = async () => {
    try {
        await signOut(auth);
        console.log("👋 Déconnecté");
        window.location.reload();
    } catch (error) {
        console.error("Erreur déconnexion:", error);
    }
};

// 3. Sauvegarder une victoire (Compatible Realtime Database)
window.saveGameWin = async (gameName, attempts) => {
    const user = auth.currentUser;
    if (!user) {
        console.warn("⚠️ Pas de sauvegarde : Utilisateur non connecté.");
        return;
    }

    const today = new Date().toISOString().split('T')[0]; // Date format YYYY-MM-DD
    const userStatsPath = `users/${user.uid}/stats/${gameName}`;

    try {
        console.log(`💾 Sauvegarde en cours pour ${gameName}...`);
        
        // 1. Lire les stats actuelles
        const snapshot = await get(child(ref(db), userStatsPath));
        let currentStats = snapshot.val() || { wins: 0, streak: 0 };

        // 2. Préparer les mises à jour
        const updates = {};
        updates[userStatsPath + '/wins'] = (currentStats.wins || 0) + 1;
        updates[userStatsPath + '/streak'] = (currentStats.streak || 0) + 1;
        updates[userStatsPath + '/lastPlayed'] = today;
        
        // 3. Ajouter une entrée dans l'historique
        const newHistoryKey = push(child(ref(db), userStatsPath + '/history')).key;
        updates[userStatsPath + '/history/' + newHistoryKey] = {
            date: today,
            attempts: attempts
        };

        // 4. Envoyer à la base de données
        await update(ref(db), updates);
        console.log(`✅ Victoire ${gameName} sauvegardée avec succès !`);
        
    } catch (e) {
        console.error("❌ Erreur sauvegarde:", e);
    }
};

// 4. Charger les stats du joueur
window.loadUserStats = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const snapshot = await get(child(ref(db), `users/${user.uid}/stats`));
        if (snapshot.exists()) {
            return snapshot.val();
        }
    } catch (e) {
        console.error("Erreur lecture stats:", e);
    }
    return null;
};

// ============================================================
// 🎨 GESTION DE L'INTERFACE (Afficher/Cacher les boutons)
// ============================================================
function updateUI(user) {
    // On récupère les éléments HTML
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userNameDisplay = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar');

    if (user) {
        // --- MODE CONNECTÉ ---
        if(loginBtn) loginBtn.classList.add('hidden'); // Cacher le bouton login
        if(userProfile) {
            userProfile.classList.remove('hidden'); // Afficher le profil
            if(userNameDisplay) userNameDisplay.innerText = user.displayName;
            if(userAvatar) userAvatar.src = user.photoURL;
        }
    } else {
        // --- MODE VISITEUR ---
        if(loginBtn) loginBtn.classList.remove('hidden'); // Afficher le bouton login
        if(userProfile) userProfile.classList.add('hidden'); // Cacher le profil
    }
}

// Écouter si l'utilisateur est déjà connecté quand la page charge
onAuthStateChanged(auth, (user) => {
    updateUI(user);
    if(user) {
        console.log(`👤 Session active : ${user.email}`);
    }
});
