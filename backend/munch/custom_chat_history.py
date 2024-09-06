# pylint: disable=E0401
# pylint: disable=W0718
"""Custom class for chats and message history"""

import os
import django
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.chat_history import BaseChatMessageHistory
from .models import Message
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webserver.settings')
django.setup()

class CustomChatMessageHistory(BaseChatMessageHistory):
    """
    Manages chat message history by storing and retrieving messages from the database.
    This class is initialized with a session ID and user ID to manage session-specific chat history.
    """

    def __init__(self, session_id: str, user_id: str):
        """
        Initializes the chat message history for a given session ID and user ID.

        Args:
            session_id (str): The session ID to manage messages for.
            user_id (str): The user ID to manage messages for.
        """
        super().__init__()

        self.session_id = session_id
        self.user_id = user_id
        self.messages = []
        self.initialize_session()

    def get_sessions(self):
        """
        Retrieves all unique session IDs that match the given user_id.

        Args:
            user_id (str): The user ID to filter sessions by.

        Returns:
            List[str]: A list of unique session IDs associated with the user.
        """
        # Query the database for messages that match the user_id and get distinct session IDs
        session_ids = Message.objects.filter(user_id=self.user_id).values_list('session_id', flat=True).distinct()
        return list(session_ids)

    def check_spam(self):
        """
        Checks if the user has sent more than 15 messages within the last 2 minutes.

        Raises:
            ValidationError: If the user has sent too many messages in the given timeframe.
        """
        time_window_start = timezone.now() - timedelta(minutes=2)
        recent_message_count = Message.objects.filter(
            session_id=self.session_id,
            user_id=self.user_id,
            timestamp__gte=time_window_start
        ).count()

        if recent_message_count >= 45:
            raise ValidationError("You have sent too many messages in a short period. Please wait before sending more.")

    def add_message(self, message):
        """
        Adds a message to the current session's message history and saves it to the database.

        Args:
            message (Union[HumanMessage, AIMessage]): The message to add.

        Raises:
            ValidationError: If the user has sent too many messages in the given timeframe.
        """
        self.check_spam()  # Check for spam before adding the message
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
        if isinstance(message, str):
            Message.objects.create(
                session_id=self.session_id,
                user_id=self.user_id,
                message_type="humanmessage_no_prompt",
                content=message
            )
        else:
            Message.objects.create(
                session_id=self.session_id,
                user_id=self.user_id,
                message_type=message.__class__.__name__.lower(),
                content=message.content
            )

    def load_messages_from_db(self):
        """
        Loads all messages from the database for the current session ID and user ID and stores them in memory.
        """
        db_messages = Message.objects.filter(session_id=self.session_id, user_id=self.user_id)
        for db_message in db_messages:
            if db_message.message_type == 'humanmessage':
                self.messages.append(HumanMessage(content=db_message.content))
            elif db_message.message_type == 'aimessage':
                self.messages.append(AIMessage(content=db_message.content))

    def clear_messages_from_db(self):
        """
        Deletes all messages from the database for the current session ID and user ID.
        """
        Message.objects.filter(session_id=self.session_id, user_id=self.user_id).delete()

    def initialize_session(self):
        """
        Initializes the session by loading existing messages or setting up a new session with default messages.
        """
        if not Message.objects.filter(session_id=self.session_id, user_id=self.user_id).exists():
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


    def get_conversation_by_session(self):
        db_messages = Message.objects.filter(session_id=self.session_id, user_id=self.user_id).order_by('timestamp')
        messages = []
        first_non_prompt_human_message_seen = False
        for db_message in db_messages:
            if db_message.message_type == 'humanmessage_no_prompt':
                messages.append({'message_type': 'human_no_prompt', 'content': db_message.content})
                first_non_prompt_human_message_seen = True
            elif db_message.message_type == 'aimessage' and first_non_prompt_human_message_seen:
                messages.append({'message_type': 'aimessage', 'content': db_message.content})
        return messages

    # def get_all_conversations(self):
    #     """
    #     Retrieves all conversations for a given user.

    #     Args:
    #         user_id (str): The user ID to filter conversations by.

    #     Returns:
    #         dict: A dictionary where each key is a session ID and each value is a list of messages for that session ID.
    #     """
    #     sessions = list(set(CustomChatMessageHistory.get_sessions_by_user_id()))
    #     conversations_by_session = {}
    #     for session_id in sessions:
    #         messages = []
    #         db_messages = Message.objects.filter(session_id=session_id).order_by('timestamp')
    #         first_non_prompt_human_message_seen = False
    #         for db_message in db_messages:
    #             # print(db_message.message_type)
    #             if db_message.message_type == 'humanmessage_no_prompt':
    #                 messages.append({'message_type': 'human_no_prompt', 'content': db_message.content})
    #                 first_non_prompt_human_message_seen = True
    #             elif db_message.message_type == 'aimessage' and first_non_prompt_human_message_seen:
    #                 messages.append({'message_type': 'aimessage', 'content': db_message.content})
    #         conversations_by_session[session_id] = messages

    #     return conversations_by_session
