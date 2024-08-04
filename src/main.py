import json
from openai import OpenAI
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import chromadb
import chromadb.utils.embedding_functions as embedding_functions


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
    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=OPEN_AI_API_KEY,
            model_name="text-embedding-3-small"
        )
    client = chromadb.PersistentClient(path="chroma_db")

    collection = client.get_or_create_collection(name="restaurant_collection", 
                                                        embedding_function=openai_ef, 
                                                        metadata={"hnsw:space": "cosine"}) # l2 is the default)
    
    return client, collection

def add_documents_to_collection(documents, metadata, collection):
    for i, d in enumerate(documents):
        collection.add(documents=[d], metadatas=[metadata[i]], ids=[str(i)])

# Function to format restaurant data for metadata
def format_restaurant_data(restaurants):
    formatted_data = []
    for restaurant in restaurants:
        formatted_data.append({
            "place_id": restaurant['place_id'],
            "name": restaurant['name'],
            "address": restaurant['address'],
            "rating": restaurant['rating']
        })
    return formatted_data


if __name__ == "__main__":

    # Creating documents for vector store + metadata
    documents, restaurants = documents_init()
    metadata = format_restaurant_data(restaurants)

    
    chroma_client, collection = chromadb_init()
    
    #add_documents_to_collection(documents, metadata, collection)
    print(collection.count())

    res = collection.query(
    query_texts=["i want curry"],
    n_results=3,
    include=["metadatas"])

    list_of_names = [struct['name'] for struct in res['metadatas'][0]]
    print(list_of_names)


    






