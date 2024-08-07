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


def get_google_search_places(api_key, query, max_results=100):
    url = 'https://places.googleapis.com/v1/places:searchText'
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': "places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.priceLevel,nextPageToken"
    }
    data = {
        "textQuery": query,
        "pageSize": 20
    }

    all_results = []
    next_page_token = None

    while len(all_results) < max_results:
        if next_page_token:
            data["pageToken"] = next_page_token

        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            places = result.get('places', [])
            all_results.extend(places)
            
            next_page_token = result.get('nextPageToken')
            if not next_page_token:
                break
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            break

    return all_results[:max_results]


def write_results_to_file(results):
    with open('test_data/medium-meh/restaurants.json', 'a', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
    print("finished writing")



if __name__ == "__main__":
    api_key = get_google_places_key()
    cities = ['Arcadia, CA', 'Little Tokyo, LA', 'Koreatown, LA', 'Irvine, CA', 'West Hollywood, CA', 'Santa Monica, CA', 'Beverly Hill']
    res = get_google_search_places(api_key, "Restaurants in Los Angeles", 60)
    

    for c in cities:
        res = get_google_search_places(api_key, f"Restaurants in {c}", 60)
        print(len(res))
        write_results_to_file(res)

    
    
    