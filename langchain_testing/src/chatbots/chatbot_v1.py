# pylint: disable=E0401
# pylint: disable=W0718
# pylint: disable=C0103

"""
This module initializes and uses a ChromaDB client with OpenAI embeddings to provide
restaurant recommendations based on user queries. It includes functionality to load
configuration, process documents, and interact with the user.
"""

import json
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.prompts import PromptTemplate
import chromadb

def chromadb_init(open_ai_key):
    """
    Initialize the ChromaDB client with embeddings and create or retrieve the restaurant collection.
    
    Returns:
        Chroma: The initialized Chroma client.
    """

    embeddings_model = OpenAIEmbeddings(api_key=open_ai_key, model="text-embedding-3-small")
    client = chromadb.PersistentClient(path="chroma_db")

    langchain_chroma = Chroma(
        client=client,
        collection_name="restaurant_collection",
        embedding_function=embeddings_model,
    )

    return langchain_chroma

def format_docs(docs):
    """
    Format the list of documents into a string for display.
    
    Args:
        docs (list): List of documents to format.
    
    Returns:
        str: Formatted string of document content and metadata.
    """
    res = ""
    for doc in docs:
        res += "Reviews: " + doc.page_content + "\n"
        res += "Metadata: " + json.dumps(doc.metadata, indent=4) + "\n"
        res += "\n\n"

    return res

if __name__ == "__main__":
    # Getting OpenAI API Key
    file_path = "config.json"
    with open(file_path, 'r', encoding='utf-8') as file:
        config = json.load(file)
        open_ai_api_key = config['OPEN_AI_API_KEY']

    # Loading from ChromaDB directory on disk
    chroma_client = chromadb_init(open_ai_api_key)
    retriever = chroma_client.as_retriever(search_kwargs={"k": 3})

    llm = ChatOpenAI(api_key=open_ai_api_key, model="gpt-4o-mini")
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
