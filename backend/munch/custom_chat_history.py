# pylint: disable=E0401
# pylint: disable=W0718
"""Custom class for chats and message history"""

import os
import django
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.chat_history import BaseChatMessageHistory
from .models import Message

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webserver.settings')
django.setup()

class CustomChatMessageHistory(BaseChatMessageHistory):
    """
    Manages chat message history by storing and retrieving messages from the database.
    This class is initialized with a session ID and manages the session-specific chat history.
    """

    def __init__(self, session_id: str):
        """
        Initializes the chat message history for a given session ID.

        Args:
            session_id (str): The session ID to manage messages for.
        """
        self.session_id = session_id
        self.messages = []
        self.initialize_session()

    def add_message(self, message):
        """
        Adds a message to the current session's message history and saves it to the database.

        Args:
            message (Union[HumanMessage, AIMessage]): The message to add.
        """
        self.messages.append(message)
        self.save_message_to_db(message)

    def get_messages(self):
        """
        Retrieves all messages in the current session's message history.

        Returns:
            List[Union[HumanMessage, AIMessage]]: The list of messages in the session.
        """
        return self.messages

    def clear(self):
        """
        Clears the current session's message history both in memory and in the database.
        """
        self.messages.clear()
        self.clear_messages_from_db()

    def save_message_to_db(self, message):
        """
        Saves a message to the database.

        Args:
            message (Union[HumanMessage, AIMessage]): The message to save.
        """
        Message.objects.create(
            session_id=self.session_id,
            message_type=message.__class__.__name__.lower(),
            content=message.content
        )

    def load_messages_from_db(self):
        """
        Loads all messages from the database for the current session ID and stores them in memory.
        """
        db_messages = Message.objects.filter(session_id=self.session_id)
        for db_message in db_messages:
            if db_message.message_type == 'human':
                self.messages.append(HumanMessage(content=db_message.content))
            elif db_message.message_type == 'ai':
                self.messages.append(AIMessage(content=db_message.content))

    def clear_messages_from_db(self):
        """
        Deletes all messages from the database for the current session ID.
        """
        Message.objects.filter(session_id=self.session_id).delete()

    def initialize_session(self):
        """
        Initializes the session by loading existing messages or setting up a new session with default messages.
        """
        if not Message.objects.filter(session_id=self.session_id).exists():
            # Add initial setup messages if the session is new
            initial_messages = [
                HumanMessage(content="""
                    You're a chatbot designed to assist users in finding restaurants in the Los Angeles area. When users interact with you, you'll receive a list of restaurant data, which may or may not relate to their queries. Your task is to match the user's input with the relevant restaurant information and provide helpful suggestions.

                    If the user's input doesn't align with any restaurants in the list or conversation history, kindly steer the conversation towards helping them find a restaurant based on their desires. If the user's query is unrelated to restaurants or food, politely let them know you're focused on helping them with restaurant recommendations and gently guide the conversation back to dining.

                    Keep in mind that the restaurant data you receive is just an aid—never mention it to the user. Think of it as part of your built-in knowledge. Now, you'll receive instructions on how to respond to users.
                """),
                AIMessage(content="Welcome to the restaurant chatbot! I'm here to help you find great places to eat in Los Angeles. How can I assist you today?"),
                HumanMessage(content="""
                    Guidelines:
                        - Sort the restaurants based on their ratings, from highest to lowest, and recommend the top 3 that match the user's query.
                        - If a restaurant doesn't offer the food the user desires, don't suggest it.
                        - If the list of restaurants doesn't perfectly match the user's request, use your broader knowledge to provide alternative suggestions related to the user's preferences.
                        - Act as a knowledgeable restaurant recommender after this message, without mentioning that you received any data. Assume you already had this information.
                        - Maintain the conversational context: if the user's input is related to the current discussion, even if not directly about food or restaurants, continue the conversation naturally. Only pivot back to food/restaurants if the user's input is entirely unrelated to the ongoing context (e.g., "I want a computer to play games").
                        - Politely inform the user if they ask about something unrelated to restaurants or food, and gently steer the conversation back to restaurant recommendations.
                        - Don't use numbers to list the restaurants, just list them.
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
                """),
                AIMessage(content="Got it!")
            ]
            for message in initial_messages:
                self.add_message(message)
        else:
            # Load existing session messages from the database
            self.load_messages_from_db()
