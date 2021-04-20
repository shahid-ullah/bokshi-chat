import requests
from django.contrib.auth.backends import BaseBackend

from django.contrib.auth import get_user_model
 
User = get_user_model()
headers = {'api-version': '1', 'device-id': '1234567890', 'device-type': 'android'}
# payload = {'username': 200000002986, 'password': 'abc123'}
 
 
class NothiAuthenticationBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        payload = {'username': username, 'password': password}
 
        try:
            res = requests.post(
                "https://dev.nothibs.tappware.com/api/login",
                data=payload,
                headers=headers,
            )
            if res.status_code == 200:
                content = res.json()
                if content['status'] == 'success':
                    username = content['data']['user']['username']
                    employee_name = content['data']['employee_info']['name_eng']
                    is_active=content['data']['user']['active']
                    
            else:
                return None
        except:
            return None
 
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            user = User.objects.create(username=username,username_eng=employee_name,is_active=is_active)
            user.save()
        return user
 
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None