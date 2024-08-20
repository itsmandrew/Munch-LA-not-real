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


def chromadb_init(api_key: str) -> Chroma:
    """
    Initializes the ChromaDB client and sets up the collection for restaurant data.

    Args:
        path (str): The path to the JSON configuration file containing the OpenAI API key.

    Returns:
        Chroma: The initialized Chroma client.
    """

    # Set up OpenAI embeddings model
    embeddings_model = OpenAIEmbeddings(api_key=api_key,
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

def generate_prompt(context, question):
    return f"""
        Context and metadata:
        {context}

        User Query: {question}
        """.strip()

def format_docs(docs):
    res = ""
    for doc in docs:
        res += f"Name: {doc.metadata['name']} \n"
        res += f"Address: {doc.metadata['address']} \n"
        res += f"Rating: {doc.metadata['rating']} \n"
        res += f"Review/About: {doc.page_content} \n"
        res += "\n\n"
         
    return res
