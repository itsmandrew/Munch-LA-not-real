# pylint: disable=E0401

"""
This module provides functions to interact with the Google Places API,
allowing for the retrieval of nearby places and detailed information about specific places.
"""

import json
import requests

def get_google_places(location, radius, location_type, api_key):
    """
    Fetches nearby places from Google Places API based on location, radius, and type.

    Args:
        location (str): Latitude and longitude as a string (e.g., "34.052235,-118.243683").
        radius (int): The radius around the location in meters.
        location_type (str): The type of place to search for (e.g., "restaurant").
        api_key (str): Your Google Places API key.

    Returns:
        dict: The JSON response from the API containing places information.
    """
    base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = f"location={location}&radius={radius}&type={location_type}&key={api_key}"
    place_search_url = f"{base_url}?{params}"

    response = requests.get(place_search_url, timeout=10)
    restaurants = response.json()

    return restaurants


def get_place_details(place_id, api_key):
    """
    Fetches detailed information about a specific place from the Google Places API.

    Args:
        place_id (str): The unique identifier of the place.
        api_key (str): Your Google Places API key.

    Returns:
        dict: A dictionary containing detailed information about the place, None if an error occurs.
    """
    base_url = "https://maps.googleapis.com/maps/api/place/details/json"
    fields = "name,formatted_address,rating,user_ratings_total,price_level,types,reviews"
    params = f"place_id={place_id}&fields={fields}&key={api_key}"
    url = f"{base_url}?{params}"

    response = requests.get(url, timeout=10)
    if response.status_code == 200:
        return response.json().get('result', {})
    print(f"Error: {response.status_code}")
    return None


def main():
    """
    Main function that coordinates fetching nearby restaurants and their details,
    and writes the information to a JSON file.
    """
    lat_long = '34.052235,-118.243683'
    radius_km = 5000
    location_type = 'restaurant'

    with open('config.json', 'r', encoding='utf-8') as file:
        config = json.load(file)
        api_key = config['PLACES_API_KEY']

    restaurant_json = get_google_places(lat_long, radius_km, location_type, api_key)['results']

    # Output the total number of restaurants found
    res = []
    print(f"Total restaurants found: {len(restaurant_json)}")

    # Fetch details and reviews for each restaurant
    for r in restaurant_json:
        restaurant_details = get_place_details(r['place_id'], api_key)
        reviews = [review['text'] for review in restaurant_details.get('reviews', [])]
        address = restaurant_details.get('formatted_address')

        restaurant_data = {
            "place_id": r['place_id'],
            "name": r['name'],
            "address": address,
            "rating": r['rating'],
            "business_status": r.get('business_status', 'UNKNOWN'),
            "reviews": reviews
        }
        res.append(restaurant_data)

    # Write JSON structure to a JSON file
    with open('test_data/restaurants_with_reviews.json', 'w', encoding='utf-8') as file:
        json.dump(res, file, indent=4)

    print("Restaurants with reviews have been written to restaurants_with_reviews.json")


if __name__ == "__main__":
    main()
