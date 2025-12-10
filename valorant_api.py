"""
Script pour récupérer les données Valorant d'un joueur via l'API Riot Games
"""

import requests
import json

# Clé API Riot Games
API_KEY = "RGAPI-6fa436c5-ece5-4b1d-8b0e-99119b9983aa"

# Régions disponibles
ACCOUNT_REGIONS = ["europe", "americas", "asia"]
VAL_REGIONS = ["eu", "na", "ap", "kr", "br", "latam"]

class ValorantAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.headers = {
            "X-Riot-Token": api_key
        }
    
    def get_account_by_riot_id(self, game_name, tag_line, region="europe"):
        """
        Récupère les informations du compte par Riot ID (nom#tag)
        Exemple: get_account_by_riot_id("PlayerName", "EUW")
        """
        url = f"https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur {response.status_code}: {response.text}")
            return None
    
    def get_account_by_puuid(self, puuid, region="europe"):
        """
        Récupère les informations du compte par PUUID
        """
        url = f"https://{region}.api.riotgames.com/riot/account/v1/accounts/by-puuid/{puuid}"
        
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur {response.status_code}: {response.text}")
            return None
    
    def get_valorant_content(self, val_region="eu"):
        """
        Récupère le contenu Valorant (agents, maps, etc.)
        """
        url = f"https://{val_region}.api.riotgames.com/val/content/v1/contents"
        
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur {response.status_code}: {response.text}")
            return None
    
    def get_match_history(self, puuid, val_region="eu"):
        """
        Récupère l'historique des matchs d'un joueur
        Note: Nécessite une clé API avec les permissions appropriées
        """
        url = f"https://{val_region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/{puuid}"
        
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur {response.status_code}: {response.text}")
            return None
    
    def get_match_details(self, match_id, val_region="eu"):
        """
        Récupère les détails d'un match spécifique
        """
        url = f"https://{val_region}.api.riotgames.com/val/match/v1/matches/{match_id}"
        
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur {response.status_code}: {response.text}")
            return None
    
    def get_ranked_leaderboard(self, val_region="eu", act_id=None, size=200, start=0):
        """
        Récupère le classement ranked
        """
        url = f"https://{val_region}.api.riotgames.com/val/ranked/v1/leaderboards/by-act/{act_id}"
        params = {
            "size": size,
            "startIndex": start
        }
        
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur {response.status_code}: {response.text}")
            return None


def main():
    # Initialiser l'API
    api = ValorantAPI(API_KEY)
    
    # Exemple d'utilisation - Remplace par ton Riot ID
    game_name = input("Entre ton nom de joueur (ex: PlayerName): ")
    tag_line = input("Entre ton tag (ex: EUW): ")
    
    print("\n" + "="*50)
    print("Recherche du compte...")
    print("="*50)
    
    # Récupérer les infos du compte
    account = api.get_account_by_riot_id(game_name, tag_line, region="europe")
    
    if account:
        print("\n📋 INFORMATIONS DU COMPTE:")
        print(f"  • Nom: {account.get('gameName')}#{account.get('tagLine')}")
        print(f"  • PUUID: {account.get('puuid')}")
        
        puuid = account.get('puuid')
        
        # Essayer de récupérer l'historique des matchs
        print("\n" + "="*50)
        print("Recherche de l'historique des matchs...")
        print("="*50)
        
        match_history = api.get_match_history(puuid, val_region="eu")
        
        if match_history:
            print("\n🎮 HISTORIQUE DES MATCHS:")
            matches = match_history.get('history', [])
            for i, match in enumerate(matches[:5]):  # Afficher les 5 derniers matchs
                print(f"  Match {i+1}: {match.get('matchId')}")
        else:
            print("\n⚠️  Impossible de récupérer l'historique des matchs.")
            print("    Note: L'endpoint match history nécessite une clé API Production.")
    
    # Récupérer le contenu Valorant (toujours accessible)
    print("\n" + "="*50)
    print("Récupération du contenu Valorant...")
    print("="*50)
    
    content = api.get_valorant_content(val_region="eu")
    
    if content:
        print("\n🎯 AGENTS DISPONIBLES:")
        agents = [c for c in content.get('characters', []) if c.get('name')]
        for agent in agents[:10]:  # Afficher les 10 premiers agents
            print(f"  • {agent.get('name')}")
        
        print(f"\n📍 MAPS DISPONIBLES:")
        maps = content.get('maps', [])
        for map_data in maps:
            if map_data.get('name'):
                print(f"  • {map_data.get('name')}")


if __name__ == "__main__":
    print("="*50)
    print("   VALORANT API - Récupération des données joueur")
    print("="*50)
    main()
