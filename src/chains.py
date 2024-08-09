import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
from langchain_core.runnables.history import RunnableWithMessageHistory

# Initialize OpenAI model with API key
with open('config.json', 'r') as file:
    config = json.load(file)
    OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

model = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")

# Define a function to get session history
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

# Define session ID for history
session_id = "abc2"
config = {"configurable": {"session_id": session_id}}

# Initialize RunnableWithMessageHistory
with_message_history = RunnableWithMessageHistory(model, get_session_history)

# Handle initial instruction
response = with_message_history.invoke(
    [HumanMessage(content="""
                  I'm going to give you some restaurants and details about them. Then I'll ask you to provide me some restaurants based off
                  some criteria later. List the restaurants sorted by their ratings.
                  """)],
    config=config,
)

# Read restaurant data from the JSON file
with open('../test_data/restaurants_with_reviews.json', 'r') as file:
    restaurants = json.load(file)

i = 0
# Process each restaurant in the list
for restaurant_data in restaurants:
    if i >= 5:
        break
    name = restaurant_data['name']
    address = restaurant_data['address']
    rating = restaurant_data['rating']
    business_status = restaurant_data['business_status']
    
    # Create the initial part of the input string with placeholders
    input_str = f"""
    Restaurant Data:

    name: {name}
    address: {address}
    rating: {rating}
    business status: {business_status}

    Reviews:
    """

    # Append each review to the input string
    for review in restaurant_data['reviews']:
        input_str += f"\n- {review}"# pracicing chaining (working)

import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
from langchain_core.runnables.history import RunnableWithMessageHistory

# Initialize OpenAI model with API key
with open('config.json', 'r') as file:
    config = json.load(file)
    OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

model = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")


# Define a function to get session history
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

# Define session ID for history
config = {"configurable": {"session_id": "abc2"}}

# Initialize RunnableWithMessageHistory
with_message_history = RunnableWithMessageHistory(model, get_session_history)

# Handle user message and get response
response = with_message_history.invoke(
    [HumanMessage(content="""
                  I'm going to give you some restaurants and details about them. Then I'll ask you to provide me some restaurants based off
                  some criteria later. List the restaurants sorted by their ratings.
                  """)],
    config=config,
)

# Read restaurant data from the JSON file
with open('../test_data/restaurants_with_reviews.json', 'r') as file:
    restaurants = json.load(file)

# Process each restaurant in the list
for restaurant_data in restaurants:
    name = restaurant_data['name']
    address = restaurant_data['address']
    rating = restaurant_data['rating']
    business_status = restaurant_data['business_status']
    
    # Create the initial part of the input string with placeholders
    input_str = f"""
    Restaurant Data:

    name: {name}
    address: {address}
    rating: {rating}
    business status: {business_status}

    Reviews:
    """

    # Append each review to the input string
    for review in restaurant_data['reviews']:
        input_str += f"\n- {review}"
    # Handle user message and get response
    response = with_message_history.invoke(
        [HumanMessage(content=input_str)],
        config=config,
    )

    print('Restaurant cached in memory')
    
    




# Interactive loop to handle user input and responses
while True:
    user_input = input("Input: ")

    if user_input.lower() == 'exit':
        break

    # Handle user message and get response
    response = with_message_history.invoke(
        [HumanMessage(content=user_input)],
        config=config,
    )

    print("Bot's Response: ", response.content)
    
    # Handle user message and get response
    response = with_message_history.invoke(
        [HumanMessage(content=input_str)],
        config=config,
    )

    print(f'Restaurant {i} cached in memory')
    i += 1

# Save conversation history to a file
def save_chat_history(filename: str):
    with open(filename, 'w') as file:
        chat_history = get_session_history(session_id).messages
        print('chat history', chat_history)
        json.dump([{"role": msg.role, "content": msg.content} for msg in chat_history], file)

save_chat_history('chat_history.json')
