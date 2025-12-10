"""
Script Valorant utilisant la librairie valorant.py
Documentation: https://valorant.readthedocs.io/
"""

import valorant

# Configuration
API_KEY = "RGAPI-6fa436c5-ece5-4b1d-8b0e-99119b9983aa"
PLAYER_NAME = "redzuki"
PLAYER_TAG = "1tap"
REGION = "eu"

def main():
    print()
    print("╔════════════════════════════════════════════════════════╗")
    print("║      🎯 VALORANT.PY - Stats de redzuki#1tap            ║")
    print("╚════════════════════════════════════════════════════════╝")
    print()
    
    # Créer le client
    print("⏳ Connexion à l'API Riot Games...")
    client = valorant.Client(API_KEY, region=REGION)
    
    # Récupérer le contenu du jeu
    print("⏳ Récupération du contenu Valorant...")
    content = client.get_content()
    
    print()
    print("┌────────────────────────────────────────────────────────┐")
    print("│                  🎭 AGENTS                             │")
    print("├────────────────────────────────────────────────────────┤")
    
    if content and content.characters:
        agents = [char.name for char in content.characters if char.name]
        # Afficher les agents en groupes de 5
        for i in range(0, min(len(agents), 20), 5):
            group = agents[i:i+5]
            print(f"│  {', '.join(group):<53}│")
    
    print("└────────────────────────────────────────────────────────┘")
    
    # Récupérer les maps
    print()
    print("┌────────────────────────────────────────────────────────┐")
    print("│                  🗺️  MAPS                              │")
    print("├────────────────────────────────────────────────────────┤")
    
    if content and content.maps:
        maps = [m.name for m in content.maps if m.name]
        maps_str = ', '.join(maps)
        # Couper si trop long
        if len(maps_str) > 50:
            print(f"│  {maps_str[:50]}│")
            print(f"│  {maps_str[50:100]:<53}│")
        else:
            print(f"│  {maps_str:<53}│")
    
    print("└────────────────────────────────────────────────────────┘")
    
    # Récupérer les actes/saisons
    print()
    print("┌────────────────────────────────────────────────────────┐")
    print("│                  📅 ACTES/SAISONS                      │")
    print("├────────────────────────────────────────────────────────┤")
    
    if content and content.acts:
        # Afficher les 5 derniers actes
        acts = [a for a in content.acts if a.name][-5:]
        for act in acts:
            active = "✅" if getattr(act, 'isActive', False) else "  "
            print(f"│  {active} {act.name:<51}│")
    
    print("└────────────────────────────────────────────────────────┘")
    
    # Récupérer le leaderboard
    print()
    print("⏳ Récupération du leaderboard ranked...")
    
    try:
        # Obtenir l'acte actif
        active_act = None
        if content and content.acts:
            for act in content.acts:
                if getattr(act, 'isActive', False):
                    active_act = act
                    break
        
        if active_act:
            print(f"   Acte actif: {active_act.name}")
            
            # Récupérer le leaderboard
            leaderboard = client.get_leaderboard(active_act.id, size=10)
            
            if leaderboard and leaderboard.players:
                print()
                print("┌────────────────────────────────────────────────────────┐")
                print("│              🏆 TOP 10 RANKED (EU)                     │")
                print("├────────────────────────────────────────────────────────┤")
                
                for i, player in enumerate(leaderboard.players[:10]):
                    name = player.game_name or "Hidden"
                    tag = player.tag_line or ""
                    rr = player.ranked_rating or 0
                    print(f"│  {i+1:>2}. {name}#{tag:<30} {rr:>5} RR │")
                
                print("└────────────────────────────────────────────────────────┘")
    except Exception as e:
        print(f"   ⚠️ Erreur leaderboard: {e}")
    
    # Note sur les limitations
    print()
    print("════════════════════════════════════════════════════════")
    print("  💡 Note: L'API Riot ne permet pas de récupérer les")
    print("     stats personnelles (K/D, matchs) avec une clé dev.")
    print("     Utilise tracker.gg pour tes stats complètes:")
    print(f"     https://tracker.gg/valorant/profile/riot/{PLAYER_NAME}%23{PLAYER_TAG}")
    print("════════════════════════════════════════════════════════")


if __name__ == "__main__":
    main()
