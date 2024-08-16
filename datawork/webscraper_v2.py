# pylint: disable=E0401

"""
This module provides functionality to interact with the Google Places API.
It includes functions to search for places, retrieve place details, 
and handle the configuration file.
"""

import json
import os
import time
import requests

def find_config_file(filename='config.json'):
    """Search for the configuration file in the current directory or parent directories."""
    current_dir = os.getcwd()

    while True:
        potential_path = os.path.join(current_dir, filename)
        if os.path.isfile(potential_path):
            return potential_path

        parent_dir = os.path.dirname(current_dir)
        if current_dir == parent_dir:
            raise FileNotFoundError(f"Config file '{filename}' not found in any parent directories")

        current_dir = parent_dir

def get_google_places_key():
    """Retrieve the Google Places API key from the configuration file."""
    config_path = find_config_file()

    with open(config_path, 'r', encoding='utf-8') as file:
        config = json.load(file)
        api_key = config['PLACES_API_KEY']
    return api_key

def get_google_search_places(api_key, query, max_results=100):
    """Search for places using the Google Places API based on a query."""
    url = 'https://places.googleapis.com/v1/places:searchText'
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': "places.id,places.displayName,places.formattedAddress,"
                            "places.types,places.rating,places.userRatingCount,"
                            "places.priceLevel,nextPageToken"
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

        response = requests.post(url, headers=headers, json=data, timeout=10)

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
    """Retrieve detailed information about a place, including reviews, from the Google Places API"""
    url = (
        "https://maps.googleapis.com/maps/api/place/details/json"
        f"?place_id={place_id}&fields=reviews&key={api_key}"
    )
    response = requests.get(url, timeout=10)
    if response.status_code == 200:
        return response.json().get('result', {})

    print(f"Error: {response.status_code}")
    return None

def read_existing_results(filename):
    """Read existing results from a JSON file."""
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def write_results_to_file(path, results):
    """Write results to a JSON file."""
    with open(path, 'a', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
    print("Finished writing")

def create_restaurants():
    """Create a list of restaurants in specific cities and save to a file."""
    api_key = get_google_places_key()
    cities = ['Arcadia, CA', 'Little Tokyo in Los Angeles', 'Koreatown in Los Angeles',
              'Irvine, CA', 'West Hollywood, CA', 'Santa Monica, CA', 'Beverly Hills, CA']

    for city in cities:
        restaurants = []
        query = f"Restaurants in {city}"
        restaurants.append(get_google_search_places(api_key, query, 60))
        write_results_to_file('test_data/medium-meh/restaurants.json', restaurants)

def create_restaurants_with_reviews():
    """Create a detailed list of restaurants with reviews and save to a file."""
    api_key = get_google_places_key()
    res, count = [], 0
    json_restaurants = read_existing_results('test_data/medium-meh/restaurants.json')
    print(len(json_restaurants))
    for restaurant in json_restaurants:
        restaurant_details = get_place_details(restaurant['id'], api_key)
        reviews = [review['text'] for review in restaurant_details.get('reviews', [])]

        restaurant_data = {
            "place_id": restaurant['id'],
            "name": restaurant['displayName']['text'],
            "keywords": restaurant['types'],
            "address": restaurant.get('formattedAddress', 'Unknown'),
            "rating": restaurant.get('rating', 'Unknown'),
            "price_level": restaurant.get('priceLevel', 'Unknown'),
            "num_of_reviews": restaurant.get("userRatingCount", 'Unknown'),
            "reviews": reviews
        }

        res.append(restaurant_data)
        count += 1

        # Handle large batches
        if count % 60 == 0:
            print(f"{count // 60} batch done.")
            # Write JSON structure to a JSON file
            path = 'test_data/medium-meh/restaurants_with_reviews.json'
            with open(path, 'a', encoding='utf-8') as file:
                json.dump(res, file, indent=4)
            res = []
            time.sleep(2)

    with open('test_data/medium-meh/restaurants_with_reviews.json', 'a', encoding='utf-8') as file:
        json.dump(res, file, indent=4)

    print("Restaurants with reviews have been written to restaurants_with_reviews.json")

if __name__ == "__main__":
    json_restaurants_w_reviews = read_existing_results('test_data/medium-meh/restaurants.json')
    print(len(json_restaurants_w_reviews))
