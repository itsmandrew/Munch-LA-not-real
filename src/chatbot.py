from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
import chromadb
import json

def chromadb_init():
    # Initialize ChromaDB client
    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    
    embeddings_model = OpenAIEmbeddings(api_key=OPEN_AI_API_KEY,
                                        model="text-embedding-3-small")
    

    client = chromadb.PersistentClient(path="chroma_db")

    collection = client.get_or_create_collection(name="restaurant_collection", 
                                                metadata={"hnsw:space": "cosine"}) # l2 is the default)
    
    langchain_chroma = Chroma(
        client=client,
        collection_name="restaurant_collection",
        embedding_function=embeddings_model,
    )

    return langchain_chroma

if __name__ == "__main__":

    # Loading from ChromaDB directory ON DISK
    langchain_chroma = chromadb_init()

    retriever = langchain_chroma.as_retriever()
    docs = retriever.invoke("i want indian food")
    print(docs)
