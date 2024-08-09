from langchain_experimental.text_splitter import SemanticChunker # type: ignore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
import chromadb # type: ignore
from langchain_chroma import Chroma # type: ignore
import chromadb.utils.embedding_functions as embedding_functions # type: ignore
import json
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

def documents_init():
    # Load your data
    with open('../test_data/small-bad/restaurants_with_reviews.json', 'r') as file:
        restaurants = json.load(file)

    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    template = """
    I will provide reviews of a restaurant. Please summarize give me a summary of the reviews. Things to focus on:
    - What kind of food the restaurant serves
    - What the customers think of the restaurant
    - Maybe things like the vibe/environment of the restaurant (this isn't mandatory, but if the reviews provide this information then it's good to add)
    
    Reviews:
    {reviews}
    """

    prompt = PromptTemplate.from_template(template)

    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")

    llm_chain = prompt | llm

    documents = []
    print('Creating documents with reviews summarized')
    for index, restaurant in enumerate(restaurants):
        doc = ''
        # doc += 'Name: ' + str(restaurant['name']) + '\n'
        # doc += 'Address: ' + str(restaurant['address']) + '\n'
        # doc += 'Rating: ' + str(restaurant['rating']) + '\n'
        rev = 'Reviews: \n'

        
        for review in restaurant['reviews']:
            review = review.replace('\n\n', '').replace('\n', '')
            review = review.replace('.', '.\n')
            review += '\n\n'
            rev += review

        rev_summary = llm_chain.invoke(rev).content
        doc += rev_summary
        documents.append(doc)
        print(f'Summarized Doc #{index}')
        
    # print(f'Example first document: \n{documents[0]}')
    return documents, restaurants

def chromadb_init():
    # Initialize ChromaDB client
    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=OPEN_AI_API_KEY,
            model_name="text-embedding-3-small"
        )
    client = chromadb.PersistentClient(path="chroma_db_old")

    collection = client.get_or_create_collection(name="restaurant_collection", 
                                                        embedding_function=openai_ef, 
                                                        metadata={"hnsw:space": "cosine"}) # l2 is the default)
    
    return client, collection

# Function to format restaurant data for metadata
def format_restaurant_data(restaurants):
    formatted_data = []
    for restaurant in restaurants:
        formatted_data.append({
            "place_id": restaurant['place_id'],
            "name": restaurant['name'],
            "address": restaurant['address'],
            "rating": restaurant['rating'],
        })
    return formatted_data

def split_documents_and_add_to_collection(documents, metadata, collection):
    text_splitter = SemanticChunker(OpenAIEmbeddings())
    if len(documents) != len(metadata):
        print("ERROR: doc length does not equal metadata length")
        return
    j = 0

    print('Chunking Documents')
    for i in range(len(documents)):
        document = documents[i]
        chunks = text_splitter.split_text(document)
        for chunk in chunks:
            collection.add(documents=[chunk], metadatas=[metadata[i]], ids=[str(j)])
            j += 1


if __name__ == "__main__":



    # Creating documents for vector store + metadata
    documents, restaurants = documents_init()
    metadata = format_restaurant_data(restaurants)
    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    text_splitter_recursive = RecursiveCharacterTextSplitter(
        chunk_size = 500,
        chunk_overlap = 50,
        length_function = len,
    )

    chunks = text_splitter_recursive.split_text(documents[3])
    print('RECURSIVE SPLITTER:')
    for chunk in chunks:
        print(chunk)
        print('\n\n')

    text_splitter_semantic = SemanticChunker(OpenAIEmbeddings(api_key=OPEN_AI_API_KEY,
                                        model="text-embedding-3-small"), breakpoint_threshold_type="percentile")
    
    docs = text_splitter_semantic.create_documents([documents[3]])
    print('SEMANTIC SPLITTER:')
    for doc in docs:
        print(doc)
        print('\n\n')

    # # Initialize client
    # chroma_client, collection = chromadb_init()
    
    # # Add data to database
    # split_documents_and_add_to_collection(documents, metadata, collection)

    # print('Data is is now in DB')