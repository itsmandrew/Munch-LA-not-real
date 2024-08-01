import requests
import json


# Load API key from config.json
with open('config.json', 'r') as file:
    config = json.load(file)
api_key = config['PLACES_API_KEY']


location = '34.052235,-118.243683'  # Latitude and Longitude for Los Angeles
radius = 5000  # Search within 5 km radius
location_type = 'restaurant'

place_search_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius={radius}&type={location_type}&key={api_key}"

response = requests.get(place_search_url)
restaurants = response.json().get('results', [])

print(restaurants)

# place_details_url = "https://maps.googleapis.com/maps/api/place/details/json"
