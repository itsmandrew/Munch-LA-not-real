# utils/helpers.py

# pylint: disable=E0401
# pylint: disable=W0718
# pylint: disable=C0103
# pylint: disable=R0914

"""
This module provides utility functions for interacting with 
configuration files and initializing ChromaDB.

Functions:
- chromadb_init: Initializes the ChromaDB client and sets up the collection for restaurant data.
- generate_prompt: Generates a prompt based on the context and user query.
- format_docs: Formats documents with restaurant metadata and reviews.
- documents_init: Summarizes restaurant data and returns the summarized documents and original data.
- format_restaurant_data: Extracts and formats specific restaurant information.
- split_documents_and_add_to_collection: Splits and adds documents and metadata 
  to a ChromaDB collection.
"""


import json
import os
import time
from typing import List, Dict, Tuple
from uuid import uuid4
import chromadb
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from langchain_core.documents import Document

OPEN_AI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')

def pinecone_init(index_name: str) -> PineconeVectorStore:
    """
    Initializes the Pinecone client and sets up the collection for restaurant data.

    Args:
        path (str): The path to the JSON configuration file containing the OpenAI API key.

    Returns:
        PineconeVectorStore: The initialized Pinecone client.
    """

    # Set up OpenAI embeddings model
    embeddings_model = OpenAIEmbeddings(api_key=OPEN_AI_API_KEY,
                                        model="text-embedding-3-small")

    # configure client
    pc = Pinecone(api_key=PINECONE_API_KEY)

    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

    if index_name not in existing_indexes:
        pc.create_index(
            name=index_name,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        while not pc.describe_index(index_name).status["ready"]:
            time.sleep(1)

    index = pc.Index(index_name)
    langchain_pc = PineconeVectorStore(index=index, embedding=embeddings_model)

    return langchain_pc


def chromadb_init() -> Chroma:
    """
    Initializes the ChromaDB client and sets up the collection for restaurant data.

    Args:
        path (str): The path to the JSON configuration file containing the OpenAI API key.

    Returns:
        Chroma: The initialized Chroma client.
    """

    # Set up OpenAI embeddings model
    embeddings_model = OpenAIEmbeddings(api_key=OPEN_AI_API_KEY,
                                        model="text-embedding-3-small")

    # Create or connect to a persistent ChromaDB client
    client = chromadb.PersistentClient(path="backend/chroma_db")

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
    """Will add this in the future lol"""
    return f"""
        Context and metadata:
        {context}

        User Query: {question}
        """.strip()

def format_docs(docs):
    """Will add this in the future lol"""
    res = ""
    for doc in docs:
        res += f"Name: {doc.metadata['name']} \n"
        res += f"Address: {doc.metadata['address']} \n"
        res += f"Rating: {doc.metadata['rating']} \n"
        res += f"Review/About: {doc.page_content} \n"
        res += "\n\n"

    return res

def documents_init(path: str) -> Tuple[List[str], List[Dict]]:
    """
    Generates summarized documents for each restaurant based on customer reviews.

    Args:
        path (str): Path to the JSON file containing restaurant data.

    Returns:
        Tuple[List[str], List[Dict]]: A tuple containing summarized documents 
        and original restaurant data.
    """
    # Load restaurant JSON data
    with open(path, 'r', encoding='utf-8') as file:
        restaurant_data = json.load(file)

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

def split_documents_and_add_to_collection(docs: List[str], meta: List[Dict],
                                          vector_store: object) -> None:
    """
    Adds documents and their corresponding metadata to a ChromaDB collection.

    Args:
        docs (List[str]): A list of documents containing summarized restaurant information.
        meta (List[Dict]): A list of metadata dictionaries corresponding to each document.
        db_collection (chromadb.Collection): The ChromaDB collection for storing 
            documents and metadata.
    """
    if len(docs) != len(meta):
        print("ERROR: doc length does not equal metadata length")
        return

    print('Adding data to DB')

    documents_object_list = []
    for i, m in zip(docs, meta):
        d = Document(page_content=i, metadata=m)
        documents_object_list.append(d)

    uuids = [str(uuid4()) for _ in range(len(documents_object_list))]

    vector_store.add_documents(documents=documents_object_list, ids=uuids)
