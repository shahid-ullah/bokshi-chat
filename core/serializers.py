from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.serializers import CharField, ModelSerializer

from core.models import ChatGroup, ChatGroupMessage, MessageModel, Relationship
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageModelSerializer(ModelSerializer):
    user = CharField(source='user.username', read_only=True)
    recipient = CharField(source='recipient.username')

    def create(self, validated_data):
        user = self.context['request'].user
        recipient = get_object_or_404(
            User, username=validated_data['recipient']['username']
        )
        msg = MessageModel(recipient=recipient, body=validated_data['body'], user=user,files=validated_data['files'])
        msg.save()
        return msg

    class Meta:
        model = MessageModel
        fields = ('id', 'user', 'recipient', 'timestamp', 'body','files')


class UserModelSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username','username_eng')


class RelationshipModelSerializer(ModelSerializer):
    class Meta:
        model = Relationship
        fields = '__all__'


class ChatGroupSerializer(ModelSerializer):
    class Meta:
        model = ChatGroup
        fields = ('name', 'member')


class ChatGroupDetailSerializer(ModelSerializer):
    class Meta:
        model = ChatGroup
        fields = "__all__"


class ChatGroupMessageSerializer(ModelSerializer):
    class Meta:
        model = ChatGroupMessage
        fields = "__all__"


class ChatGroupMessageDetailSerializer(ModelSerializer):
    class Meta:
        model = ChatGroupMessage
        fields = "__all__"
