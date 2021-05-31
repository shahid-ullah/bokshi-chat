# user_app/models.py
import channels.layers
from asgiref.sync import async_to_sync
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

# from .models import Job



# Create your models here.
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


# def send_message(event):
#     '''
#     Call back function to send message to the browser
#     '''
#     message = event['text']
#     channel_layer = channels.layers.get_channel_layer()
#     # Send message to WebSocket
#     async_to_sync(channel_layer.send)(text_data=json.dumps(
#         message
#     ))


@receiver(post_save, sender=UserModel)
def update_user_online_status(sender, instance, **kwargs):
    """
    Sends job status to the browser when a Job is modified
    """

    # user = instance.owner
    # group_name = 'job-user-{}'.format(user.username)
    # print()
    # print('update job status listeners called')
    # print(kwargs)
    # print()

    # message = {
    #     'job_id': instance.id,
    #     'title': instance.title,
    #     'status': instance.status,
    #     'modified': instance.modified.isoformat(),
    # }

    channel_layer = channels.layers.get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        'online_sockets',
        {
            'type': 'receive_message_from_signals',
            'text': 'this is from signals'
        }
    )
