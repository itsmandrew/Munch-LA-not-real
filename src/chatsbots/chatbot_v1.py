from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.prompts import PromptTemplate
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
    res = ""
    for doc in docs:
        res += "Reviews: " + doc.page_content + "\n"
        res += "Metadata: " + json.dumps(doc.metadata, indent=4) + "\n"
        res += "\n\n"
         

    return res


if __name__ == "__main__":


     # Getting OpenAI API Key
    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    # Loading from ChromaDB directory ON DISK
    langchain_chroma = chromadb_init()

    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 3})


    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")
    prompt = PromptTemplate.from_template(
        template="""
        Guidelines:
        1. Use the provided context and metadata to recommend a restaurant in the Los Angeles area.
        2. Sort the restaurants based on their ratings, from highest to lowest.

        Format your response as follows:
        _____________________________________________

        Restaurant Name
        * Address: address_of_restaurant

        What customers think about this restaurant:
        * Summary of customer reviews
        * Popular foods (be specific)

        ____________________________________________

        Context and metadata:
        {context}

        Question: {question}

        Helpful Answer:
        """.strip()
)

    rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
    )

    # While loop to continuously prompt for user input and generate responses
    while True:
        # Get user input
        user_input = input("Enter your question (or type 'exit' to quit): ")
        
        # Exit condition
        if user_input.lower() == 'exit':
            break
    
        
        # Invoke the RAG chain with the formatted prompt
        response = rag_chain.invoke(user_input)
        # Print the response
        print(response)

