from django.db import models

class Message(models.Model):
    session_id = models.CharField(max_length=100)
    message_type = models.CharField(max_length=10)  # 'ai' or 'human'
    content = models.TextField()

    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}"