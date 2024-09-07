"""Migrating data models lol"""
# pylint: disable=E0401
# pylint: disable=W0718
from django.contrib import admin
from .models import Message

class MessageAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'session_id', 'message_type', 'timestamp', 'content')

# Register the Message model with the Django admin site.
# This allows you to view and manage Message objects through the Django admin interface.
admin.site.register(Message, MessageAdmin)