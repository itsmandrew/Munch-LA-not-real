import json
from openai import OpenAI
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import chromadb
from chromadb.config import Settings


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

    return documents, restaurants

def get_embeddings(text_list, client):
    embeddings = []
    for text in text_list:
        response = client.embeddings.create(input=text, model='text-embedding-3-small')
        embeddings.append(response)
    return embeddings

def chromadb_init():
    # Initialize ChromaDB client
    chroma_client = chromadb.Client(Settings(
        chroma_db_impl="sqlite",
        persist_directory="chromadb_storage"
    ))

    return chroma_client


if __name__ == "__main__":

    # Basic initialization for OpenAI embedder
    client = open_ai_init()
    documents, restaurants = documents_init()
    embeddings = get_embeddings(documents, client)

    # Setting up vector store
    chroma_client = chromadb_init()

    # Create or get a collection
    collection = chroma_client.get_or_create_collection(name="restaurant_embeddings")