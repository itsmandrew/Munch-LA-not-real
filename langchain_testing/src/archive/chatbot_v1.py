# pylint: disable=E0401
# pylint: disable=W0718
# pylint: disable=C0103

"""
This module initializes and uses a ChromaDB client with OpenAI embeddings to provide
restaurant recommendations based on user queries. It includes functionality to load
configuration, process documents, and interact with the user.
"""

from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.prompts import PromptTemplate
from utils.helpers import chromadb_init, format_docs
import os

OPEN_AI_API_KEY = os.getenv('OPENAI_API_KEY')

if __name__ == "__main__":
    # Loading from ChromaDB directory on disk
    chroma_client = chromadb_init(OPEN_AI_API_KEY)
    retriever = chroma_client.as_retriever(search_kwargs={"k": 3})

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
