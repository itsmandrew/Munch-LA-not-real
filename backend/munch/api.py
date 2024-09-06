# pylint: disable=E0401
# pylint: disable=W0718

"""This module contains all the endpoints for the app"""
import os
from django.http import JsonResponse, HttpResponseBadRequest
from django.core.exceptions import ValidationError
from langchain_core.messages import HumanMessage
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
from ninja import NinjaAPI
from utils.helpers import chromadb_init, format_docs, generate_prompt
from .custom_chat_history import CustomChatMessageHistory
from .schema import MessageRequest, FindSessionIDsRequest

# Create an instance of NinjaAPI for routing and request handling
api = NinjaAPI()

# Retrieve the OpenAI API key from environment variables
OPEN_AI_API_KEY = os.getenv('OPENAI_API_KEY')

@api.post('/message')
def message(request, user_query: MessageRequest):
    """
    Handle an incoming message and return a response based on chat history and context.

    Args:
        request: The HTTP request object.
        input (MessageRequest): The data payload containing user message and session ID.

    Returns:
        JsonResponse: JSON response with the system's reply or error message.
    """
    # Check the request method
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST requests are allowed.")
    


    # Extract user message and session ID from the request input
    user_id = user_query.user_id
    user_message = user_query.user_message
    session_id = user_query.session_id

    # Custom function to manage chat history based on session ID
    def get_session_history(session_id: str) -> BaseChatMessageHistory:
        """
        Retrieve or create a CustomChatMessageHistory instance for the given session ID.

        Args:
            session_id (str): The ID of the session.

        Returns:
            BaseChatMessageHistory: The session history object.
        """
        return CustomChatMessageHistory(session_id, user_id=user_id)

    # try: 
    # Configure the session
    conf = {'configurable': {'session_id': session_id}}

    # Initialize the ChromaDB client
    langchain_chroma = chromadb_init(OPEN_AI_API_KEY)
    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 5})

    # Initialize the LLM (Large Language Model) for response generation
    llm = ChatOpenAI(api_key=OPEN_AI_API_KEY, model="gpt-4o-mini")
    with_message_history = RunnableWithMessageHistory(llm, get_session_history)

    # Create an instance of CustomChatMessageHistory
    chat_history = CustomChatMessageHistory(session_id=session_id, user_id=user_id)

    # Add the message to the chat history
    chat_history.add_message(user_message)

    # Retrieve and format context from the retriever
    context = format_docs(retriever.invoke(user_message))

    # Generate the prompt based on the context and user message
    prompt = generate_prompt(context, user_message)

    # Get the response from the LLM using the prompt and session history
    response = with_message_history.invoke(
        [HumanMessage(content=prompt)],
        config=conf
    )

    print(chat_history.get_conversation_by_session())
    # Return the response in JSON format
    return JsonResponse({'input': response.content, 'sender': 'system'})

    # except ValidationError as e:
    #     # Handle the ValidationError (e.g., too many messages in a short period)
    #     return JsonResponse({'error': str(e)}, status=400)
    # except Exception as e:
    #     # Handle any other unexpected exceptions
    #     return JsonResponse({'error': 'An unexpected error occurred.'}, status=500)
    

@api.post('/get_user_messages')
def get_user_messages(request, payload: FindSessionIDsRequest):
    """
    Handle an incoming request to retrieve all session IDs for a given user.

    Args:
        request: The HTTP request object.
        payload (FindSessionIDsRequest): An object containing the user ID.

    Returns:
        JsonResponse: JSON response with the list of session IDs or an error message.
    """
    user_id = payload.user_id
    
    # try:
        # Retrieve the list of session IDs associated with the given user ID
    res = CustomChatMessageHistory.get_all_conversations(user_id=user_id)
    i = 0
    for session_id in res:
        print(res[session_id])
        i += 1
        if i > 3:
            break
    # except Exception as e:
    #     return JsonResponse({'error': str(e)}, status=500)