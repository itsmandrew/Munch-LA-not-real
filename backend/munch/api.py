from django.http import JsonResponse
from .custom_chat_history import CustomChatMessageHistory
from langchain_core.messages import HumanMessage
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
import os
from .schema import MessageRequest
from utils.helpers import chromadb_init, format_docs, generate_prompt
from ninja import NinjaAPI

# Create an instance of NinjaAPI for routing and request handling
api = NinjaAPI()

# Retrieve the OpenAI API key from environment variables
OPEN_AI_API_KEY = os.getenv('OPENAI_API_KEY')

# Custom function to manage chat history based on session ID
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    """
    Retrieve or create a CustomChatMessageHistory instance for the given session ID.

    Args:
        session_id (str): The ID of the session.

    Returns:
        BaseChatMessageHistory: The session history object.
    """
    return CustomChatMessageHistory(session_id)

# Define a POST endpoint for handling incoming messages
@api.post('/message')
def message(request, input: MessageRequest):
    """
    Handle an incoming message and return a response based on chat history and context.

    Args:
        request: The HTTP request object.
        input (MessageRequest): The data payload containing user message and session ID.

    Returns:
        JsonResponse: JSON response with the system's reply.
    """
    # Extract user message and session ID from the request input
    user_message = input.user_message
    session_id = input.session_id
    
    # Configure the session
    conf = {'configurable': {'session_id': session_id}}
    
    # Initialize the ChromaDB client
    langchain_chroma = chromadb_init(OPEN_AI_API_KEY)
    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 5})
    
    # Initialize the LLM (Large Language Model) for response generation
    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")
    with_message_history = RunnableWithMessageHistory(llm, get_session_history)
    
    # Retrieve and format context from the retriever
    context = format_docs(retriever.invoke(user_message))
    
    # Generate the prompt based on the context and user message
    prompt = generate_prompt(context, user_message)
    
    # Get the response from the LLM using the prompt and session history
    response = with_message_history.invoke(
        [HumanMessage(content=prompt)],
        config=conf
    )

    # Return the response in JSON format
    return JsonResponse({'input': response.content, 'sender': 'system'})
