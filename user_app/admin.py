# user_app/admin.py
from django.contrib import admin

from .models import UserModel

admin.site.register(UserModel)
