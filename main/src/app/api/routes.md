# Routes

## get_available_sessions
* Used for when a new chat is created, because it returns the next session that's available for the user
* Example input body:

```
{
    "user_id": "1"
}
```

* Return JSON Format:

```
{
    "next_session_id": 4
}
```

## get_conversation
* Used for when a user clicks on a specific chat. It will load up the chat
* Example input body:

```
{
    "user_id": "1",
    "session_id": "4"
}
```

* Return JSON Format:

```
{
    "conversation": [
        {
            "message_type": "human_message_no_prompt",
            "content": "hi"
        },
        {
            "message_type": "ai_message",
            "content": {
                "general_response": "Hello! How can I assist you with finding a restaurant in Los Angeles today?",
                "restaurants": []
            }
        }
    ]
}
```

## get_conversations
* Used for when the page first loads up, this is how you get a list of the user's conversation to display on the side bar (returns list in order of most recent session that's had a new chat)
* Example input body:

```
{
    "user_id": "1"
}
```

* Return JSON Format:

```
{
    "sessions": [
        {
            "session_id": "4",
            "conversation_preview": "Hello! How can I assist you with finding a restaurant in Los Angeles today?",
            "last_updated": "2024-09-14T09:09:11.438Z"
        },
        {
            "session_id": "1",
            "conversation_preview": "Hello! How can I assist you today? If you're looking for restaurant suggestions in Los Angeles, feel free to ask!",
            "last_updated": "2024-09-14T08:54:54.499Z"
        },
        {
            "session_id": "3",
            "conversation_preview": "Here are some great Korean restaurants in Los Angeles that you might enjoy!",
            "last_updated": "2024-09-14T08:54:25.567Z"
        },
        {
            "session_id": "2",
            "conversation_preview": "Hello John! How can I assist you today? Are you looking for restaurant recommendations in Los Angeles?",
            "last_updated": "2024-09-14T08:51:29.784Z"
        }
    ]
}
```

## send_message
* Used for when the user sends a chat to the chatbot, will return a response from the AI
* Example input body:

```
{
    "user_id": "1",
    "session_id": "4",
    "message": "i want 2 sushi spots"
}
```

* Return JSON Format:

```
{
    "aiResponse": {
        "general_response": "Here are two great sushi spots in Los Angeles:",
        "restaurants": [
            {
                "name": "Tenno Sushi",
                "address": "207 S Central Ave, Los Angeles, CA 90012, USA",
                "rating": 4.4,
                "price": "Moderate",
                "summary": "Highly praised Japanese restaurant known for fresh sushi and generous portions. Favorites include sushi and sashimi lunch combos, spider rolls, and rainbow rolls. Friendly service and vibrant atmosphere, though parking is limited."
            },
            {
                "name": "Sushi Takeda",
                "address": "123 Astronaut Ellison S Onizuka St ste 307 3rd floor, Los Angeles, CA 90012, USA",
                "rating": 4.6,
                "price": "Expensive",
                "summary": "Renowned for its exceptional Omakase experience with fresh and authentic sushi. Cozy atmosphere with attentive service. Some difficulty in finding the location; considered a hidden gem."
            }
        ]
    }
}
```
