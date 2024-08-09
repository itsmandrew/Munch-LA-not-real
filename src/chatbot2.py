from langchain_chroma import Chroma # type: ignore
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_experimental.text_splitter import SemanticChunker # type: ignore
from langchain import hub
import chromadb # type: ignore
import json
import getpass
import time

# Define a function to get session history, storing chat history in memory
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    # If session_id doesn't exist, create a new InMemoryChatMessageHistory object
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

def chromadb_init():
    # Initialize ChromaDB client
    with open('config.json', 'r') as file:
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
    print(f'Number of instances in DB: {collection.count()}')
    
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
    with open('config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

    # Set up session ID and configuration for message history tracking
    session_id = "abc2"
    conf = {"configurable": {"session_id": session_id}}

    # Initialize ChromaDB and retrieve restaurant data
    langchain_chroma = chromadb_init()

    # Set up a retriever to find the top 5 matching restaurants based on user input
    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 5})

    # Initialize the LLM (GPT-4Omini) with chat history functionality
    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")
    with_message_history = RunnableWithMessageHistory(llm, get_session_history)

    # Send an initial setup prompt to the LLM to define its role and guidelines
    response = with_message_history.invoke(
        [HumanMessage(content="""
                    You're a bot that will talk to a user. Everytime the user talks to you, there will be a list of restaurant data that may or may not
                      be related to the user's message. Since you're a bot that will help users find restaurants, you will answer the user if their input
                      is related to any of the restaurants in the list or in the history of the conversation. Obviously, if the user says something that doesn't
                      have anything to do with the restaurants you know, then just kindly let the user know you're only here to help them find good restaurants
                      based on their desires. The next thing you'll recieve are instructions on how to respond to users. After that, it's just you and the user talking
                      about delicious food and restaurants, but you'll also recieve a list of restaurants! The user's input will be labeled "User Query". Also don't mention
                      that you're recieving restaurant data with every user query. Imagine that's me as a third party giving you information but don't mention anything about me!
                    """)],
        config=conf,
    )

    # Send a second prompt with detailed guidelines for responding to the user
    second_prompt = """
        Guidelines:
        - If a restaurant doesn't mention the food that the user wants at all, then don't suggest that restaurant
        - Use the soon-to-be provided context and metadata to recommend a restaurant in the Los Angeles area.
        - Sort the restaurants based on their ratings, from highest to lowest.
        - Remember, you're going to be acting a recommender of restaurants for the user after this message, don't mention that I gave you
            the data for the restaurants and just act like you already had it
        - If the user asks for something not restaurant or food related, then say you only answer questions about restaurants
        - The next message will be restaurant data and at the end there will be an input from the user
        - A query from the user can just be food itself, remember that!
        - After the user's initial query you don't have to restrict on what kind of answer you give if the user talks back
            just speak normal
        - However if the user queries for more restaurant/food related things then you can always send a response in the format below
        - Also, everytime the user talks to you, it'll include a list of restaurants. It's up to you to decide if the user's query
            has any relation to any of the restaurants. If it doesn't relate to ANY of them then just kindly let the user know that you're only here to help them
            find a restaurant to eat at or something like that.
        - If the provided list of restaurant data doesn't match what the user's asking for, then you can just use your pretrained
            data to answer their question as long as it's FOOD or RESTAURANT related
        - Display the best 3-5 restaurants based off the user's query (if the restaurants listed are relevant to the query)
        

        Format your responses as follows, but only when we ask for information about the restaurants:
        _____________________________________________

        Restaurant Name
        * Address: address_of_restaurant

        What customers think about this restaurant:
        * Summary of customer reviews
        * Popular foods (be specific)
        * Rating of the restaurant
        """
    
    # Send the second prompt to the LLM to complete its setup and readiness to respond
    response = with_message_history.invoke(
        [HumanMessage(content=second_prompt)],
        config=conf,
    )

    # Loop to interact with the user and provide restaurant recommendations
    while True:
        user_input = input("User: ")
        
        if user_input == 'exit':
            break
        
        # Start timing the retrieval of relevant restaurant data
        start_time = time.time()
        context = format_docs(retriever.invoke(user_input))
        end_time = time.time()
        print("TIME TO QUERY: ", end_time-start_time)

        # Start timing the response generation process
        start_time = time.time()
        prompt = generate_prompt(context, user_input)
        
        # Invoke the LLM with the generated prompt and current session configuration
        response = with_message_history.invoke(
            [HumanMessage(content=prompt)],
            config=conf,
        )
        end_time = time.time()
        
        # Display the chatbot's response and the time it took to generate it
        print('\nBot: ', response.content, '\n')
        print("TIME TO FOR GPT TO RESPOND: ", end_time-start_time)
