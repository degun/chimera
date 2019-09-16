import os
import django
from channels.routing import get_default_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from api.models import User
from django.urls import path
from api.consumers import TransactionConsumer
from channels.auth import AuthMiddlewareStack
from config.token_auth import JsonTokenAuthMiddlewareStack

application = ProtocolTypeRouter({
    "websocket": JsonTokenAuthMiddlewareStack(
        URLRouter([
            path('notifications/', TransactionConsumer),
        ])
    ),
})
