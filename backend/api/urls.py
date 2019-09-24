from django.conf.urls import url, include
from rest_framework import routers
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token, verify_jwt_token
from api.views import UserViewSet, TransactionViewSet, LogViewSet

ROUTER = routers.DefaultRouter()
ROUTER.register(r'users', UserViewSet)
ROUTER.register(r'transactions', TransactionViewSet)
ROUTER.register(r'logs', LogViewSet)

urlpatterns = [
    url(r'^', include(ROUTER.urls)),
    url(r'^', include('django.contrib.auth.urls')),
    url(r'^auth/', include('rest_auth.urls')),
    url(r'^auth-jwt/', obtain_jwt_token),
    url(r'^auth-jwt-refresh/', refresh_jwt_token),
    url(r'^auth-jwt-verify/', verify_jwt_token),
]