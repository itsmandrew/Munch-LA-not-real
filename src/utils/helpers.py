import json
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
import chromadb
from langchain_chroma import Chroma

def get_openai_key(path):
    with open(path, 'r') as file:
            config = json.load(file)
            OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']
    return OPEN_AI_API_KEY

def get_tavily_key(path):
    with open(path, 'r') as file:
            config = json.load(file)
            TAVILY_API_KEY = config['TAVILY_API_KEY']
    return TAVILY_API_KEY

def chromadb_init(path):
    # Initialize ChromaDB client
    with open(path, 'r') as file:
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