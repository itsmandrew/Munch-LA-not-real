import json
from openai import OpenAI
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import numpy as np

nltk.download('punkt')
nltk.download('stopwords')

def open_ai_init():
    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_ORG_ID = config['OPEN_AI_ORG_ID']
        OPEN_AI_PROJECT_ID = config['OPEN_AI_PROJECT_ID']
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    client = OpenAI(
    organization=OPEN_AI_ORG_ID,
    project=OPEN_AI_PROJECT_ID,
    api_key=OPEN_AI_API_KEY
    )

    return client

def clean_text(text):
    # Preprocess the text data
    stop_words = set(stopwords.words('english'))
    tokens = word_tokenize(text.lower())
    tokens = [word for word in tokens if word.isalpha() and word not in stop_words]
    return ' '.join(tokens)


def documents_init():
    # Load your data
    with open('test_data/restaurants_with_reviews.json', 'r') as file:
        restaurants = json.load(file)

    documents = [clean_text(f"{restaurant['name']} {restaurant['address']} {restaurant['reviews']}") for restaurant in restaurants]

    return documents

def get_embeddings(text_list, client):
    embeddings = []
    for text in text_list:
        response = client.embeddings.create(input=text, model='text-embedding-3-small')
        embeddings.append(response['data'][0]['embedding'])
    return embeddings



if __name__ == "__main__":
    client = open_ai_init()
    documents = documents_init()
    embeddings = get_embeddings(documents, client)
    print(embeddings)