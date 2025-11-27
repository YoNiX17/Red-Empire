/**
 * RED EMPIRE - MOTEUR ELO (Style League of Legends)
 * Gère le calcul des points, les rangs et la progression.
 */

// --- CONFIGURATION DES RANGS ---
export const RANKS = [
    { 
        id: 'iron',
        name: "RECRUE", 
        minElo: 0, 
        color: "#9ca3af", // Gris
        img: "https://i.postimg.cc/nV5nXzYN/Gemini_Generated_Image_l1ucwl1ucwl1ucwl_removebg_preview.png" 
    },
    { 
        id: 'bronze',
        name: "TROOPER", 
        minElo: 500, // Point de départ moyen
        color: "#f3f4f6", // Blanc sale
        img: "https://i.postimg.cc/gc5GxJqN/Gemini_Generated_Image_gklw0egklw0egklw_removebg_preview.png" 
    },
    { 
        id: 'silver',
        name: "GÉNÉRALE", 
        minElo: 1000, 
        color: "#a855f7", // Violet
        img: "https://i.postimg.cc/XNhnrJcD/Gemini_Generated_Image_e0ue2se0ue2se0ue_removebg_preview.png" 
    },
    { 
        id: 'gold',
        name: "SUPRÊME", 
        minElo: 1500, 
        color: "#38bdf8", // Bleu Cyan
        img: "https://i.postimg.cc/8k3T75BY/Gemini_Generated_Image_fwd624fwd624fwd6_removebg_preview.png" 
    },
    { 
        id: 'diamond',
        name: "IMPÉRIAL", 
        minElo: 2000, 
        color: "#ef4444", // Rouge
        img: "https://i.postimg.cc/c1jdvHMD/Gemini_Generated_Image_ebp72aebp72aebp7_removebg_preview_(1).png" 
    },
    { 
        id: 'master',
        name: "DIEU", 
        minElo: 2500, 
        color: "#facc15", // Or
        img: "https://i.postimg.cc/v8jG4BLv/Gemini_Generated_Image_66i96w66i96w66i9_removebg_preview.png" 
    }
];

export class EloSystem {
    
    constructor() {
        this.BASE_ELO = 500; // Elo de départ pour un nouveau joueur
        this.K_FACTOR = 32;  // Facteur de volatilité standard (comme les échecs/LoL bas niveau)
        this.K_FACTOR_HIGH = 10; // Pour les hauts rangs (plus stable)
    }

    /**
     * Récupère les infos complètes du rang actuel basé sur l'Elo
     * @param {number} elo - Le score Elo du joueur
     */
    getRankInfo(elo) {
        // On cherche le rang le plus élevé dont le minElo est <= elo actuel
        // On inverse le tableau pour trouver le plus haut en premier, ou on utilise findLast si supporté
        // Ici méthode compatible :
        let currentRank = RANKS[0];
        let nextRank = RANKS[1];

        for (let i = 0; i < RANKS.length; i++) {
            if (elo >= RANKS[i].minElo) {
                currentRank = RANKS[i];
                nextRank = RANKS[i + 1] || null; // Null si on est Dieu
            }
        }

        // Calcul des LP (League Points) dans la division
        // Ex: Elo 650, Trooper commence à 500, Next à 1000.
        // Différence = 500. Progression = 150. % = 30%.
        let progress = 100;
        let lp = 0;

        if (nextRank) {
            const totalRange = nextRank.minElo - currentRank.minElo;
            const currentProgress = elo - currentRank.minElo;
            progress = Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
            lp = currentProgress; // LP affichés
        } else {
            // Si rang max (Dieu)
            lp = elo - currentRank.minElo;
        }

        return {
            ...currentRank,
            lp: Math.floor(lp),
            progressPercent: progress,
            nextRank: nextRank
        };
    }

    /**
     * Calcule le nouvel Elo après un match
     * @param {number} playerElo - Elo actuel du joueur
     * @param {number} opponentElo - Elo de l'adversaire
     * @param {boolean} isWin - true si victoire, false si défaite
     * @param {number} matchCount - (Optionnel) Nombre de matchs joués pour ajuster le K-Factor (placement)
     * @returns {object} { newElo, diff }
     */
    calculateNewElo(playerElo, opponentElo, isWin, matchCount = 100) {
        // 1. Déterminer le Score Réel (1 pour victoire, 0 pour défaite)
        const actualScore = isWin ? 1 : 0;

        // 2. Calculer l'Espérance de gain (Probabilité de victoire)
        // Formule : E = 1 / (1 + 10 ^ ((EloAdverse - EloJoueur) / 400))
        const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

        // 3. Ajustement du K-Factor (Comme LoL : Placement vs Grind)
        let k = this.K_FACTOR;
        
        if (matchCount < 10) {
            k = 50; // "Placements" : L'Elo bouge très vite au début
        } else if (playerElo > 2000) {
            k = 15; // Haut niveau : L'Elo bouge moins vite
        }

        // 4. Calcul final
        // NouveauElo = AncienElo + K * (ScoreRéel - Espérance)
        let change = Math.round(k * (actualScore - expectedScore));

        // Bonus LoL : Empêcher de perdre trop de points si on est tout en bas
        if (playerElo + change < 0) {
            change = -playerElo; // On ne descend pas sous 0
        }

        return {
            newElo: playerElo + change,
            diff: change, // Ex: +15 ou -12
            kFactorUsed: k
        };
    }

    /**
     * Simule une probabilité de victoire (pour l'affichage "Chances de gagner")
     */
    getWinProbability(playerElo, opponentElo) {
        const prob = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
        return (prob * 100).toFixed(1);
    }
}

// Instance globale exportée
export const eloEngine = new EloSystem();
