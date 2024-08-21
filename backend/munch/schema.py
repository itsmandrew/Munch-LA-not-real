from ninja import Schema

class MessageRequest(Schema):
    """
    Schema representing the expected structure of an incoming API request
    that contains a user's message and the associated session ID.
    """
    user_message: str  # The message input provided by the user.
    session_id: str     # The unique identifier for the current chat session.
