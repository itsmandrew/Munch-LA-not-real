# pylint: disable=E0401
# pylint: disable=W0718

from ninja import Schema
from typing import List

class MessageRequest(Schema):
    """
    Schema representing the expected structure of an incoming API request
    that contains a user's message and the associated session ID.
    """
    user_id: str
    user_message: str  # The message input provided by the user.
    session_id: str     # The unique identifier for the current chat session.

class FindSessionIDsRequest(Schema):
    """
    Schema representing the expected structure of an incoming API request
    that contains a user's message and the associated session ID.
    """
    # user_message: str  # The message input provided by the user.
    user_id: str     # The unique identifier for the current chat session.


class GetConversation(Schema):
    """
    Schema representing the expected structure of an incoming API request
    that contains a user's message and the associated session ID.
    """
    # user_message: str  # The message input provided by the user.
    user_id: str     # The unique identifier for the current chat session.
    session_id: str

