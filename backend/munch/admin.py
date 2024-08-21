from django.contrib import admin
from .models import Message

# Register the Message model with the Django admin site.
# This allows you to view and manage Message objects through the Django admin interface.
admin.site.register(Message)