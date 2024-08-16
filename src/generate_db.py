# pylint: disable=[E0401, W0718, C0301, R0914]

"""
This module generates a vector database of restaurant information using ChromaDB.
It processes restaurant data, summarizes reviews, and stores the information in a vector database.
"""

import json
from typing import List, Dict, Tuple
import chromadb
from chromadb.utils import embedding_functions
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

def documents_init(path: str) -> Tuple[List[str], List[Dict]]:
    """
    Generates summarized documents for each restaurant based on customer reviews.

    Args:
        path (str): Path to the JSON file containing restaurant data.

    Returns:
        Tuple[List[str], List[Dict]]: A tuple containing summarized documents and original restaurant data.
    """
    # Load restaurant JSON data
    with open(path, 'r', encoding='utf-8') as file:
        restaurant_data = json.load(file)

    # Get API key
    with open('src/config.json', 'r', encoding='utf-8') as file:
        config = json.load(file)
        open_ai_api_key = config['OPEN_AI_API_KEY']

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
    llm = ChatOpenAI(api_key=open_ai_api_key, model="gpt-4o-mini")
    llm_chain = prompt | llm
    summarized_documents = []

    # Create docs for every restaurant with summarized reviews
    print('Creating documents with reviews summarized')
    for index, restaurant in enumerate(restaurant_data):
        name = restaurant['name']
        price = restaurant['price_level']
        keywords = ', '.join(restaurant['keywords'])
        rev = f"Reviews for {name}: \n"

        for review in restaurant['reviews']:
            review = review.replace('\n\n', '').replace('\n', '')
            review = review.replace('.', '.\n')
            rev += f"{review}\n\n"

        rev_summary = llm_chain.invoke({'reviews': rev, 'price': price,
                                        'keywords': keywords}).content
        summarized_documents.append(rev_summary)
        print(f'Summarized Doc #{index}')

    print('All docs generated \n')
    print(f'Example first document: \n{summarized_documents[0]}')

    return summarized_documents, restaurant_data

def chromadb_init() -> Tuple[chromadb.PersistentClient, chromadb.Collection]:
    """
    Initializes a ChromaDB vector database and returns the client and collection.

    Returns:
        Tuple[chromadb.PersistentClient, chromadb.Collection]: The ChromaDB client and collection.
    """
    # Get API key
    with open('src/config.json', 'r', encoding='utf-8') as file:
        config = json.load(file)
        open_ai_api_key = config['OPEN_AI_API_KEY']

    # Set embedding function
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=open_ai_api_key,
            model_name="text-embedding-3-small"
        )

    # Create DB
    client = chromadb.PersistentClient(path="src/chroma_db")
    db_collection = client.get_or_create_collection(name="restaurant_collection_large",
                                            embedding_function=openai_ef,
                                            metadata={"hnsw:space": "cosine"}) # l2 is the default)

    return client, db_collection

def format_restaurant_data(restaurant_data: List[Dict]) -> List[Dict]:
    """
    Formats restaurant data extracted from a JSON file.

    Args:
        restaurant_data (List[Dict]): A list of dictionaries containing restaurant information.

    Returns:
        List[Dict]: A list of formatted dictionaries with selected restaurant information.
    """
    return [{
        "place_id": restaurant['place_id'],
        "name": restaurant['name'],
        "address": restaurant['address'],
        "rating": restaurant['rating'],
    } for restaurant in restaurant_data]

def split_documents_and_add_to_collection(docs: List[str], meta: List[Dict], db_collection: chromadb.Collection) -> None:
    """
    Adds documents and their corresponding metadata to a ChromaDB collection.

    Args:
        docs (List[str]): A list of documents containing summarized restaurant information.
        meta (List[Dict]): A list of metadata dictionaries corresponding to each document.
        db_collection (chromadb.Collection): The ChromaDB collection for storing documents and metadata.
    """
    if len(docs) != len(meta):
        print("ERROR: doc length does not equal metadata length")
        return

    print('Adding data to DB')
    for i, (document, metadata) in enumerate(zip(docs, meta)):
        db_collection.add(documents=[document], metadatas=[metadata], ids=[str(i)])

if __name__ == "__main__":
    # Creating documents for vector store + metadata
    summarized_docs, restaurants_data = documents_init('test_data/medium-meh/restaurants_with_reviews.json')
    formatted_metadata = format_restaurant_data(restaurants_data)

    # Initialize client
    chroma_client, chroma_collection = chromadb_init()

    # Add data to database
    split_documents_and_add_to_collection(summarized_docs, formatted_metadata, chroma_collection)

    print('Data is now in DB')
