from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain import hub
import chromadb
import json
import getpass

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


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


if __name__ == "__main__":


     # Getting OpenAI API Key
    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    # Loading from ChromaDB directory ON DISK
    langchain_chroma = chromadb_init()

    retriever = langchain_chroma.as_retriever()

    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")
    prompt = hub.pull("rlm/rag-prompt")

    rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
    )

    response = rag_chain.invoke("give me some sushi spots to eat")
    print(response)

