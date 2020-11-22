from api.models import Transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from api.models import User

@receiver(post_save, sender=Transaction)
def announce_create_transaction(sender, instance, created, **kwargs):
    if created:
        user = User.objects.filter(email=instance.user)[0]
        user_id = user.pk
        username = user.username
        transaction_type = instance.transaction_type
        message = ""
        if(transaction_type == "Wire" or transaction_type == "Credit Card" or transaction_type == "BTC"):
            message = "A new deposit of {} € was made by client {} via {} and {} € were assigned to your account.".format(instance.amount, instance.client_name, instance.transaction_type, instance.amount_paid)
        if(transaction_type == "Withdraw"):
            message = "Client {} withdrawed {} €. Your balance was decreased by {} €.".format(instance.client_name, instance.amount, instance.amount_paid)
        if(transaction_type == "Payment"):
            message = "A payment of {} € was made to your account".format(instance.amount)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "group-{}".format(user_id), {
                "type": "transaction.created",
                "message": message,
                "id": instance.pk
            }
        )

@receiver(post_delete, sender=Transaction)
def announce_delete_transaction(sender, instance, **kwargs):
    print("deleted")
    print(instance)
    user = User.objects.filter(email=instance.user)[0]
    user_id = user.pk
    username = user.username
    transaction_type = instance.transaction_type
    message = ""
    if(transaction_type == "Wire" or transaction_type == "Credit Card" or transaction_type == "BTC"):
        message = "A transaction of {} €, made by client {} via {} was deleted. Your balance was decreased by {} €.".format(instance.amount, instance.client_name, instance.transaction_type, instance.amount_paid)
    if(transaction_type == "Withdraw"):
        message = "A withdrawal of {} € by client {} was deleted. Your balance was increased by {} €.".format(instance.amount, instance.client_name, instance.amount_paid)
    if(transaction_type == "Payment"):
        message = "A payment of {} € was deleted".format(instance.amount)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "group-{}".format(user_id), {
            "type": "transaction.deleted",
            "message": message,
            "id": instance.pk
        }
    )
        