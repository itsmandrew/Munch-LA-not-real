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


def get_google_places(location, radius, location_type, api_key):
    place_search_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius={radius}&type={location_type}&key={api_key}"

    response = requests.get(place_search_url)
    restaurants = response.json()

    return restaurants


if __name__ == "__main__":
    print(get_google_places_key())