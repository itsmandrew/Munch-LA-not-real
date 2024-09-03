# Generated by Django 4.2.15 on 2024-08-27 23:41

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('munch', '0002_alter_message_options_alter_message_content_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now, help_text='The time when the message was created'),
            preserve_default=False,
        ),
    ]
