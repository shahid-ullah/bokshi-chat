# chat/consumers.py

import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if not self.scope['user'].is_anonymous:
            user_id = self.scope["session"]["_auth_user_id"]
            self.group_name = "{}".format(user_id)
            self.online_group_name = "online_users"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.channel_layer.group_add(
                self.online_group_name, self.channel_name
            )
            await self.accept()
            await self.socket_connection_increment()
            # await self.send(text_data=json.dumps({'message': 'shahidullah'}))
        else:
            await self.close()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.socket_connection_decrement()

    # Receive message from WebSocket
    # async def receive(self, text_data=None,bytes_data = None):

    #     text_data_json = json.loads(text_data)
    #     message = text_data_json['message']
    #     print("the id is ",message)
    #     # Send message to room group(channel layer)
    #     print("The chat_group_name is ",self.chat_group_name)
    #     await self.channel_layer.group_send(
    #         self.chat_group_name,
    #         {
    #             'type': 'recieve_group_message',
    #             'message': message
    #         }
    #     )

    async def receive_online_status_notification(self, event):
        # print('receive online status notification')
        username = event.get('username')
        socket_connection = event.get('socket_connection')
        message = {'username': username, 'socket_connection': socket_connection}
        # breakpoint()
        # await self.send(text_data=json.dumps({'message': message, 'signal': True }))
        await self.send(text_data=json.dumps({'message': message, 'signal': True}))

    async def recieve_group_message(self, event):
        message = event['message']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({'message': message, 'signal': False}))

    @database_sync_to_async
    def socket_connection_increment(self):
        id = int(self.scope['user'].id)
        user = User.objects.get(id=id)
        user.socket_connection += 1
        user.save()

    @database_sync_to_async
    def socket_connection_decrement(self):
        id = int(self.scope['user'].id)
        user = User.objects.get(id=id)
        user.socket_connection -= 1
        user.save()


# class GroupChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         print("connect called")
#         # self.room_name = self.scope['url_route']['kwargs']['room_name']
#         # self.room_group_name = 'chat_%s' % self.room_name
#         self.room_group_name = 'test'

#         # Join room group
#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)

#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

#     # Receive message from WebSocket
#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']
#         # model_name =ChatGroupMessage.objects.get()

#         # Send message to room group
#         await self.channel_layer.group_send(
#             self.room_group_name, {'type': 'chat_message', 'message': message}
#         )

#     # Receive message from room group
#     async def chat_message(self, event):
#         message = event['message']
#         # group_name = ChatGroup.objects.all()[1]
#         # author_name = User.objects.all()[1]
#         # ChatGroupMessage(group_name=group_name, author=author_name, message=message)
#         # ChatGroupMessage.objects.create(group_name=group_name, author=author_name, message=message)
#         group_name = await self.group_name()
#         author_name = await self.author_name()
#         await self.post_message(group_name=group_name, author_name=author_name, message=message)

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({'message': message}))

#     @database_sync_to_async
#     def group_name(self):
#         return ChatGroup.objects.all()[1]


#     @database_sync_to_async
#     def author_name(self):
#         return  User.objects.all()[1]


#     @database_sync_to_async
#     def post_message(self, group_name, author_name, message):
#         # GroupMessage.objects.create(group=self.room_group_name, message=message)
#         ChatGroupMessage.objects.create(group_name=group_name, author=author_name, message=message)
