import requests
import json
import os
import time

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


def get_place_details(place_id, api_key):
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews&key={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        result = response.json().get('result', {})
        return result
    else:
        print(f"Error: {response.status_code}")
        return None

def read_existing_results(filename):
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []




def write_results_to_file(path, results):
    with open(path, 'a', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
    print("finished writing")


def create_restaurants():
    api_key = get_google_places_key()
    cities = ['Arcadia, CA', 'Little Tokyo in Los Angeles', 'Koreatown in Los Angeles', 'Irvine, CA', 'West Hollywood, CA', 'Santa Monica, CA', 'Beverly Hills, CA']

    restaurants = []
    for c in cities:
        restaurants = []
        query = f"Restaurants in {c}"
        restaurants.append(get_google_search_places(api_key, query, 60))
        write_results_to_file('test_data/medium-meh/restaurants.json', restaurants)

if __name__ == "__main__":
    
    api_key = get_google_places_key()
    res, count = [], 0
    json_restaurants = read_existing_results('test_data/medium-meh/restaurants.json')

    for r in json_restaurants[0:1]:
        
        restaurant_details = get_place_details(r['id'], api_key)
        reviews = [review['text'] for review in restaurant_details.get('reviews', [])]

        restaurant_data = {
            "place_id": r['id'],
            "name": r['displayName']['text'],
            "keywords": r['types'],
            "address": r.get('formattedAddress', 'Unknown'),
            "rating": r.get('rating', 'Unknown'),
            "price_level": r.get('priceLevel', 'Unknown'),
            "num_of_reviews": r.get("userRatingCount", 'Unknown'),
            "reviews": reviews
        }

        res.append(restaurant_data)
        count += 1
        
        # Handles large batches
        if count % 60 == 0:
            print(f"{count // 60} batch done.")
            # Write JSON structure to a JSON file
            with open('test_data/medium-meh/restaurants_with_reviews.json', 'w') as file:
                json.dump(res, file, indent=4)

            res = []
        


    with open('test_data/medium-meh/restaurants_with_reviews.json', 'w') as file:
        json.dump(res, file, indent=4)



    print("Restaurants with reviews have been written to restaurants_with_reviews.json")

    
    
    