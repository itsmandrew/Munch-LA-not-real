# pylint: disable=E0401
# pylint: disable=W0718

"""Data models for SQLite database"""

from django.db import models

class Message(models.Model):
    """
    Model representing a chat message in the database. Each message is associated with a 
    session ID and includes the type of message (human or AI) and the 
    content of the message.
    """

    session_id = models.CharField(max_length=100,
                                help_text="Unique identifier for the chat session.")
    message_type = models.CharField(max_length=10,
                                help_text="Indicates whether the message is from a human or AI.")
    content = models.TextField(help_text="The text content of the message.")
    timestamp = models.DateTimeField(auto_now_add=True, help_text="The time when the message was created")

    def __str__(self):
        """
        Returns a string representation of the message, showing the 
        type of the message and a truncated version of the content for easy identification.
        """
        return f"{self.message_type}: {self.content[:50]}"

    class Meta:
        """
        Meta options for the Message model.
        """
        verbose_name = "Chat Message"
        verbose_name_plural = "Chat Messages"
        ordering = ['-id']  # Orders by the latest messages first
