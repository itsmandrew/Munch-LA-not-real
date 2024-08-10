from langchain_chroma import Chroma # type: ignore
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain import hub
import chromadb # type: ignore
import json
import time
import os

# Define a function to get session history, storing chat history in memory
store1 = {}
store2 = {}

def get_session_history1(session_id: str) -> BaseChatMessageHistory:
    # If session_id doesn't exist, create a new InMemoryChatMessageHistory object
    if session_id not in store1:
        store1[session_id] = InMemoryChatMessageHistory()
    return store1[session_id]

def get_session_history2(session_id: str) -> BaseChatMessageHistory:
    # If session_id doesn't exist, create a new InMemoryChatMessageHistory object
    if session_id not in store2:
        store2[session_id] = InMemoryChatMessageHistory()
    return store2[session_id]

def chromadb_init():
    # Initialize ChromaDB client
    with open('src/config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    # Set up OpenAI embeddings model
    embeddings_model = OpenAIEmbeddings(api_key=OPEN_AI_API_KEY,
                                        model="text-embedding-3-small")
    
    # Create or connect to a persistent ChromaDB client
    client = chromadb.PersistentClient(path="src/chroma_db")

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

# Function to generate a prompt based on context and a user query
def generate_prompt(context, question):
    res = f"""
        Context and metadata:
        {context}

        User Query: {question}
        """.strip()
    
    return res

# Function to format documents for display
def format_docs(docs):
    res = ""
    for doc in docs:
        res += f"Name: {doc.metadata['name']} \n"
        res += f"Address: {doc.metadata['address']} \n"
        res += f"Rating: {doc.metadata['rating']} \n"
        res += f"Review/About: {doc.page_content} \n"
        res += "\n\n"
         
    return res

if __name__ == "__main__":

    # Get OpenAI API Key from the configuration file
    with open('src/config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    # Set up session ID and configuration for message history tracking
    session_id1 = "abc2"
    conf1 = {"configurable": {"session_id": session_id1}}
    session_id2 = "abc3"
    conf2 = {"configurable": {"session_id": session_id2}}

    # Initialize ChromaDB and retrieve restaurant data
    langchain_chroma = chromadb_init()

    # Set up a retriever to find the top 5 matching restaurants based on user input
    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 5})

    # Initialize the LLM (GPT-4Omini) with chat history functionality
    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")
    with_message_history = RunnableWithMessageHistory(llm, get_session_history1)

    query_cleaner = RunnableWithMessageHistory(llm, get_session_history2)

    # Send an initial setup prompt to the LLM to define its role and guidelines
    response = with_message_history.invoke(
        [HumanMessage(content="""
                    You're a chatbot designed to assist users in finding restaurants in the Los Angeles area. When users interact with you, you'll receive a list of restaurant data, which may or may not relate to their queries. Your task is to match the user's input with the relevant restaurant information and provide helpful suggestions.

                    If the user's input doesn't align with any restaurants in the list or conversation history, kindly steer the conversation towards helping them find a restaurant based on their desires. If the user's query is unrelated to restaurants or food, politely let them know you're focused on helping them with restaurant recommendations and gently guide the conversation back to dining.

                    Keep in mind that the restaurant data you receive is just an aid—never mention it to the user. Think of it as part of your built-in knowledge. Now, you'll receive instructions on how to respond to users.

                    """)],
        config=conf1,
    )

    query_cleaner.invoke(
        [HumanMessage(content="""
            You are going to be a tool that takes in user queries and modifies the queries to only extract the important parts. 
            Your output will be used to query a vector database, so it's important that you only extract the important parts of 
            the user's query. The vector database contains restaurant information.

            Additionally, you may also receive conversation context. This context will help you understand what the conversation 
            was about prior to the user's query. For example, if the conversation was about outdoor dining and the user responds 
            with "yes," you should include the context of outdoor dining in your generated query. Always consider the provided 
            conversation context when generating your output. The context you should consider should really only be about food/restaurant.
        """)],
        config=conf2,
    )

    # Send a second prompt with detailed guidelines for responding to the user
    second_prompt = """
       Guidelines:
        - Sort the restaurants based on their ratings, from highest to lowest, and recommend the top 3 that match the user's query.
        - If a restaurant doesn't offer the food the user desires, don't suggest it.
        - If the list of restaurants doesn't perfectly match the user's request, use your broader knowledge to provide alternative suggestions related to the user's preferences.
        - Act as a knowledgeable restaurant recommender after this message, without mentioning that you received any data. Assume you already had this information.
        - Maintain the conversational context: if the user's input is related to the current discussion, even if not directly about food or restaurants, continue the conversation naturally. Only pivot back to food/restaurants if the user's input is entirely unrelated to the ongoing context (e.g., "I want a computer to play games").
        - Politely inform the user if they ask about something unrelated to restaurants or food, and gently steer the conversation back to restaurant recommendations.
        - Use the format below when providing restaurant information, but only when explicitly asked about the restaurants:

        _____________________________________________

        **Restaurant Name**
        * Address: address_of_restaurant

        **What customers think about this restaurant:**
        * Summary of customer reviews
        * Popular foods (be specific)
        * Rating of the restaurant
        * Price point
        _____________________________________________

        """
    
    # Send the second prompt to the LLM to complete its setup and readiness to respond
    response = with_message_history.invoke(
        [HumanMessage(content=second_prompt)],
        config=conf1,
    )

    # Loop to interact with the user and provide restaurant recommendations
    convo_context = ''
    while True:
        user_input = input("Enter your question: ")
        
        if user_input == 'exit':
            break
        
        # Start timing the retrieval of relevant restaurant data
        start_time = time.time()

        # Clean the user input before querying in DB
        cleaned_input = query_cleaner.invoke(
            [HumanMessage(content=f"{user_input} \n Convo Context: {convo_context}")],
            config=conf2,
        ).content

        print("Cleaned INPUT: ", cleaned_input)
        context = format_docs(retriever.invoke(cleaned_input))
        end_time = time.time()
        print("Time to query: ", end_time-start_time)

        # Start timing the response generation process
        start_time = time.time()
        prompt = generate_prompt(context, user_input)
        
        # Invoke the LLM with the generated prompt and current session configuration
        response = with_message_history.invoke(
            [HumanMessage(content=prompt)],
            config=conf1,
        )
        convo_context = response.content
        end_time = time.time()
        
        # Display the chatbot's response and the time it took to generate it
        print('\nBot: ', response.content, '\n')
        print("GPT Response Time: ", end_time-start_time, '\n')