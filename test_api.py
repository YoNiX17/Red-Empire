import requests

API_KEY = 'RGAPI-6fa436c5-ece5-4b1d-8b0e-99119b9983aa'
headers = {'X-Riot-Token': API_KEY}

game_name = 'redzuki'
tag_line = '1tap'

print('=' * 50)
print('Recherche du compte redzuki#1tap...')
print('=' * 50)

for region in ['europe', 'americas', 'asia']:
    url = f'https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}'
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        account = response.json()
        print(f'\nCompte trouve sur {region.upper()}!')
        print(f'\nINFORMATIONS DU COMPTE:')
        print(f'  Nom: {account.get("gameName")}#{account.get("tagLine")}')
        print(f'  PUUID: {account.get("puuid")}')
        
        puuid = account.get('puuid')
        
        print('\n' + '=' * 50)
        print('Recherche de l historique des matchs...')
        print('=' * 50)
        
        match_url = f'https://eu.api.riotgames.com/val/match/v1/matchlists/by-puuid/{puuid}'
        match_response = requests.get(match_url, headers=headers)
        
        if match_response.status_code == 200:
            match_history = match_response.json()
            print('\nHISTORIQUE DES MATCHS:')
            matches = match_history.get('history', [])
            for i, match in enumerate(matches[:5]):
                print(f'  Match {i+1}: {match.get("matchId")}')
        else:
            print(f'\nHistorique matchs: Erreur {match_response.status_code}')
            print('   (Necessite une cle API Production)')
        
        break
    elif response.status_code == 404:
        print(f'Compte non trouve sur {region}')
    else:
        print(f'Erreur {response.status_code} sur {region}: {response.text}')
