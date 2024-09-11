# pylint: disable=E0401
# pylint: disable=W0718

from django.apps import AppConfig


class MunchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'munch'
