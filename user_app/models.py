# user_app/models.py
import channels.layers
from asgiref.sync import async_to_sync
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

channel_layer = channels.layers.get_channel_layer()


class UserModel(AbstractUser):
    username_eng = models.CharField(blank=True, max_length=100)
    username_bng = models.CharField(blank=True, max_length=100)
    personal_email = models.EmailField(blank=True)
    personal_mobile = models.CharField(blank=True, max_length=100)
    office_name_eng = models.CharField(blank=True, max_length=100)
    office_name_bng = models.CharField(blank=True, max_length=100)
    designation = models.CharField(blank=True, max_length=100)
    nid = models.CharField(blank=True, max_length=50)
    date_of_birth = models.CharField(blank=True, max_length=50)
    active = models.BooleanField(default=True)
    father_name_eng = models.CharField(blank=True, max_length=100)
    father_name_bng = models.CharField(blank=True, max_length=100)
    socket_connection = models.IntegerField(default=0)

    def get_socket_connections(self):
        return self.socket_connection

    def __str__(self):
        return self.username


@receiver(post_save, sender=UserModel)
def notify_user_online_status(sender, instance, **kwargs):
    """
    Sends user status to the browser when a UserModel is modified
    """
    # print('update user online status called')

    # After login model update occurs twice
    # only inform once when update_fields is not last_login
    update_fields = kwargs.get('update_fields')
    if update_fields is None:

        async_to_sync(channel_layer.group_send)(
            'online_users',
            {
                'type': 'receive_online_status_notification',
                'username': str(instance.username_eng),
                'socket_connection': str(instance.socket_connection),
            },
        )
