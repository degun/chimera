from channels.generic.websocket import AsyncJsonWebsocketConsumer

class TransactionConsumer(AsyncJsonWebsocketConsumer):
    
    async def connect(self):
        self.group_name = "group-{}".format(self.scope['user'].pk)
        print(self.group_name)
        await self.accept()
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        print(f"Added {self.channel_name} channel to ")
    
    async def disconnect(self, close_code):
        self.group_name = self.scope['user'].pk 
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print(f"Removed {self.channel_name} channel from transactions")

    async def transaction_created(self, event):
        await self.send_json(event)
        print(f"Got {event} at {self.channel_name}")

    async def transaction_deleted(self, event):
        await self.send_json(event)
        print(f"Got {event} at {self.channel_name}")