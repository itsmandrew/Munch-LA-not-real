import requests
import json

LOCATION = '34.052235,-118.243683'  # Latitude and Longitude for Los Angeles
RADIUS = 5000  # Search within 5 km radius
LOCATION_TYPE = 'restaurant'

def get_google_places(location, radius, location_type, api_key):
    place_search_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius={radius}&type={location_type}&key={api_key}"

    response = requests.get(place_search_url)
    restaurants = response.json()

    return restaurants


if __name__ == "__main__":
    
    # Load API key from config.json
    with open('config.json', 'r') as file:
        config = json.load(file)
    api_key = config['PLACES_API_KEY']

    restaurant_json = get_google_places(LOCATION, RADIUS, LOCATION_TYPE, api_key)['results']

    # Output the total number of restaurants found
    res = []
    print(f"Total restaurants found: {len(restaurant_json)}")
    print(restaurant_json[0].keys())

    for r in restaurant_json:
        res.append(
            {
                "place_id": r['place_id'],
                "name": r['name'],
                "rating": r['rating'],
                "business_status": r['business_status']
            }
        )
    
    # Write reviews to a JSON file
    with open('test_data/restaurants.json', 'w') as file:
        json.dump(res, file, indent=4)

    print("Restaurants have been written to restaurants.json")