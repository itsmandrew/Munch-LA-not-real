# gen_db.py
# Use this code to generate a vector database of summarized restaurant reviews

import json
from openai import OpenAI
import chromadb # type: ignore
import chromadb.utils.embedding_functions as embedding_functions # type: ignore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

def documents_init(path):
    """
    Generates summarized documents for each restaurant based on customer reviews.

    This function reads a JSON file containing restaurant data, including customer reviews.
    It then summarizes the reviews using an LLM (GPT-4Omini) and creates a text document for
    each restaurant, containing the restaurant's name and the summarized review.

    The function also prints progress updates and returns a list of summarized documents along 
    with the original restaurant data.

    Returns:
        tuple: A tuple containing:
            - documents (list of str): A list of summarized restaurant documents.
            - restaurants (list of dict): The original list of restaurant data loaded from the JSON file.
    """

    # Load your restaurant JSON data
    with open(path, 'r') as file:
        restaurants = json.load(file)

    # Get your API key
    with open('src/config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    # Template to summarize the reviews of the restaurant
    template = """
        I will provide you with reviews/info of a restaurant. Please summarize these reviews in 1-3 sentences.

        ### Must Include in the Summary:
        - A comprehensive list of all the food items mentioned in the reviews (include every single food the restaurant serves).
        - A general summary of how customers feel about the restaurant, reflecting the overall sentiment.
        - Key pros of the restaurant as highlighted by the reviews.
        - Key cons of the restaurant as highlighted by the reviews.
        - Price range (if given)
        - Key descriptions of the restaurant

        ### Optional to Include in the Summary:
        - Information about the vibe or environment of the restaurant, but only if the reviews mention it specifically.

        ### Reviews:
        {reviews}

        ### Price:
        {price}

        ### Key Descriptions of Restaurant:
        {keywords}
    """

    # Create LLM chain
    prompt = PromptTemplate.from_template(template)
    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")
    llm_chain = prompt | llm
    documents = []

    # Create docs for every restaurant with summarized reviews
    print('Creating documents with reviews summarized')
    for index, restaurant in enumerate(restaurants):
        name = restaurant['name']
        price = restaurant['price_level']
        keywords = ', '.join(restaurant['keywords'])
        doc = ''
        rev = f"Reviews for {name}: \n"

        
        for review in restaurant['reviews']:
            review = review.replace('\n\n', '').replace('\n', '')
            review = review.replace('.', '.\n')
            review += '\n\n'
            rev += review

        rev_summary = llm_chain.invoke({'reviews': rev, 'price': price, 'keywords': keywords}).content
        doc += rev_summary
        documents.append(doc)
        print(f'Summarized Doc #{index}')
    
    print('All docs generated \n')
    print(f'Example first document: \n{documents[0]}')

    return documents, restaurants


def chromadb_init():
    """
    Initializes a ChromaDB vector database and returns the client and collection.

    This function sets up a connection to a ChromaDB database for storing restaurant 
    data embeddings. It retrieves the OpenAI API key from a configuration file and 
    sets up an embedding function using the 'text-embedding-3-small' model. The 
    database is initialized with cosine similarity as the distance metric.

    Returns:
        tuple: A tuple containing:
            - client (chromadb.PersistentClient): The ChromaDB client.
            - collection (chromadb.Collection): The initialized collection in the database.
    """

    # Get API key
    with open('src/config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    # Set embedding function
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=OPEN_AI_API_KEY,
            model_name="text-embedding-3-small"
        )
    
    # Create DB
    client = chromadb.PersistentClient(path="src/chroma_db")
    collection = client.get_or_create_collection(name="restaurant_collection_large", 
                                                        embedding_function=openai_ef, 
                                                        metadata={"hnsw:space": "cosine"}) # l2 is the default)
    
    return client, collection


def format_restaurant_data(restaurants):
    """
    Formats restaurant data extracted from a JSON file.

    This function takes a list of dictionaries, where each dictionary represents
    a restaurant's information, and extracts specific fields ('place_id', 'name', 
    'address', and 'rating'). It returns a list of dictionaries containing only these 
    fields for each restaurant.

    Args:
        restaurants (list of dict): A list of dictionaries where each dictionary
            contains information about a restaurant. This data is typically read
            from a JSON file.

    Returns:
        list of dict: A list of dictionaries, each containing the 'place_id',
            'name', 'address', and 'rating' of a restaurant.
    """

    formatted_data = []
    for restaurant in restaurants:
        formatted_data.append({
            "place_id": restaurant['place_id'],
            "name": restaurant['name'],
            "address": restaurant['address'],
            "rating": restaurant['rating'],
        })
    return formatted_data

# 
def split_documents_and_add_to_collection(documents, metadata, collection):
    """
    Adds documents and their corresponding metadata to a ChromaDB collection.

    This function directly adds each document and its associated metadata to the
    specified ChromaDB collection. It first checks that the number of documents matches 
    the number of metadata entries. If they do not match, the function prints an error 
    message and returns without adding any data.

    Args:
        documents (list of str): A list of documents containing summarized restaurant information.
        metadata (list of dict): A list of metadata dictionaries corresponding to each document.
        collection (chromadb.Collection): The ChromaDB collection where the documents and metadata will be stored.
    """
    
    if len(documents) != len(metadata):
        print("ERROR: doc length does not equal metadata length")
        return

    print('Adding data to DB')
    for i in range(len(documents)):
        document = documents[i]
        collection.add(documents=[document], metadatas=[metadata[i]], ids=[str(i)])

if __name__ == "__main__":

    # Creating documents for vector store + metadata
    documents, restaurants = documents_init('test_data/medium-meh/restaurants_with_reviews.json')
    metadata = format_restaurant_data(restaurants)
    
    # Initialize client
    chroma_client, collection = chromadb_init()
    
    # Add data to database
    split_documents_and_add_to_collection(documents, metadata, collection)

    print('Data is is now in DB')