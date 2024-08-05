import requests
import json
import os

def find_config_file(filename='config.json'):
    current_dir = os.getcwd()
    
    while True:
        potential_path = os.path.join(current_dir, filename)
        if os.path.isfile(potential_path):
            return potential_path
        
        parent_dir = os.path.dirname(current_dir)
        if current_dir == parent_dir:
            raise FileNotFoundError(f"Config file '{filename}' not found in any parent directories.")
        
        current_dir = parent_dir

def get_google_places_key():
    config_path = find_config_file()
    
    with open(config_path, 'r') as file:
        config = json.load(file)
        api_key = config['PLACES_API_KEY']
    return api_key


def get_google_search_places(api_key, query):
    url = 'https://places.googleapis.com/v1/places:searchText'

    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': """places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.priceLevel,nextPageToken"""
    }

    data = {
        "textQuery": query,
        "pageSize": 3
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None


if __name__ == "__main__":
    api_key= get_google_places_key()
    res = get_google_search_places(api_key, "restaurants in Los Angeles")

    print(json.dumps(res, indent=4))