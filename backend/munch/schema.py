from ninja import Schema

class MessageRequest(Schema):
    user_message: str
    session_id: str