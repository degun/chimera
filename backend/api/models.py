from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import ugettext_lazy as _
from django.conf import settings

class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(_('email address'), unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return "{}".format(self.email)

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='partner_data')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    Wrate = models.DecimalField(max_digits=3, decimal_places=2, default=1)
    CCrate = models.DecimalField(max_digits=3, decimal_places=2, default=1)
    BTCrate = models.DecimalField(max_digits=3, decimal_places=2, default=1)
    btc = models.BooleanField(default=False)

class Transaction(models.Model):
    transaction_type = models.CharField(max_length=12)
    client_name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    rate = models.DecimalField(max_digits=3, decimal_places=2, default=1)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='partner', on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=9, decimal_places=2)
    entry_time = models.DateTimeField(auto_now_add=True)

# class TransactionType(models.Model):
#     transaction_type = models.CharField(max_length=12, unique=True, primary_key=True)
#     accounting_key = models.CharField(max_length=1)

# class UserTransaction(models.Model):
#     transaction_type = models.ForeignKey(TransactionType)
#     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transaction_types')
#     rate = models.DecimalField(max_digits=3, decimal_places=2, default=1)

class Log(models.Model):
    log_type = models.CharField(max_length=20)
    message = models.CharField()
    entry_time = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user', null=True, blank=True, on_delete=models.SET_NULL)
