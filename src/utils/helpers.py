# pylint: disable=E0401
# pylint: disable=W0718
# pylint: disable=C0103

"""
utils/helpers.py

This module provides utility functions for interacting with 
configuration files and initializing ChromaDB.

Functions:
- get_openai_key: Retrieves the OpenAI API key from a specified JSON configuration file.
- get_tavily_key: Retrieves the Tavily API key from a specified JSON configuration file.
- chromadb_init: Initializes the ChromaDB client and sets up the collection for restaurant data.
"""

import json
from langchain_openai import OpenAIEmbeddings
import chromadb
from langchain_chroma import Chroma

def get_openai_key(path: str) -> str:
    """
    Retrieves the OpenAI API key from a specified JSON configuration file.

    Args:
        path (str): The path to the JSON configuration file.

    Returns:
        str: The OpenAI API key.
    """
    with open(path, 'r', encoding='utf-8') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']
    return OPEN_AI_API_KEY

def get_tavily_key(path: str) -> str:
    """
    Retrieves the Tavily API key from a specified JSON configuration file.

    Args:
        path (str): The path to the JSON configuration file.

    Returns:
        str: The Tavily API key.
    """
    with open(path, 'r', encoding='utf-8') as file:
        config = json.load(file)
        TAVILY_API_KEY = config['TAVILY_API_KEY']
    return TAVILY_API_KEY

def chromadb_init(path: str) -> Chroma:
    """
    Initializes the ChromaDB client and sets up the collection for restaurant data.

    Args:
        path (str): The path to the JSON configuration file containing the OpenAI API key.

    Returns:
        Chroma: The initialized Chroma client.
    """
    # Read configuration file to get the OpenAI API key
    with open(path, 'r', encoding='utf-8') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    # Set up OpenAI embeddings model
    embeddings_model = OpenAIEmbeddings(api_key=OPEN_AI_API_KEY,
                                        model="text-embedding-3-small")

    # Create or connect to a persistent ChromaDB client
    client = chromadb.PersistentClient(path="chroma_db")

    # Get or create a collection for restaurant data, using cosine similarity for embedding
    collection = client.get_or_create_collection(name="restaurant_collection_large",
                                            metadata={"hnsw:space": "cosine"}) # l2 is the default)

    # Print the number of instances in the collection
    print(f'Number of instances in DB: {collection.count()} \n')

    # Wrap ChromaDB client and collection into a LangChain Chroma object
    langchain_chroma = Chroma(
        client=client,
        collection_name="restaurant_collection_large",
        embedding_function=embeddings_model,
    )

    return langchain_chroma
