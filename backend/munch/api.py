from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from langchain import LLMChain, PromptTemplate
from langchain.llms import OpenAI  # or any other model you're using
import json
from .custom_chat_history import CustomChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.chat_history import BaseChatMessageHistory

from langchain_core.messages import HumanMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
import chromadb
import sys
import os
from .schema import MessageRequest

from ninja import NinjaAPI

api = NinjaAPI()

with open('/Users/haroldmo/Documents/Projects/Los-Angeles-Eatz/backend/config.json', 'r') as file:
    config = json.load(file)
    OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

def chromadb_init():
    with open('/Users/haroldmo/Documents/Projects/Los-Angeles-Eatz/backend/config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    embeddings_model = OpenAIEmbeddings(api_key=OPEN_AI_API_KEY, model="text-embedding-3-small")
    client = chromadb.PersistentClient(path="/Users/haroldmo/Documents/Projects/Los-Angeles-Eatz/src/chroma_db")
    collection = client.get_or_create_collection(name="restaurant_collection_large", metadata={"hnsw:space": "cosine"})

    print(f'Number of instances in DB: {collection.count()} \n')

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

# Define your custom chat history management
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    return CustomChatMessageHistory(session_id)


@api.post('/message')
def message(request, input: MessageRequest):
    user_message = input.user_message
    session_id = input.session_id
    conf = {'configurable': {'session_id': session_id}}
    langchain_chroma = chromadb_init()
    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 5})
    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")
    with_message_history = RunnableWithMessageHistory(llm, get_session_history)
    context = format_docs(retriever.invoke(user_message))
    prompt = generate_prompt(context, user_message)
    response = with_message_history.invoke(
        [HumanMessage(content=prompt)],
        config=conf
    )

    return JsonResponse({'input': response.content, 'sender': 'system'})