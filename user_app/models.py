from django.db import models
from django.contrib.auth.models import AbstractUser

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

    def __str__(self):
        return self.username
    
    
