# core/urls.py
from django.contrib.auth.decorators import login_required
from django.urls import include, path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter

from core.api import (AddMembershipAPI, GetFilesAPI, MemberListView,
                      MessageModelViewSet, SearchUserListAPI, UserModelViewSet,
                      UserRemoveAPIView)
from core.views import home

router = DefaultRouter()
router.register(r'message', MessageModelViewSet, basename='message-api')
router.register(r'user', UserModelViewSet, basename='user-api')
# router.register(r'group', GroupMessageView, basename='group-api')

urlpatterns = [
    path(r'api/v1/', include(router.urls)),
    path('api/v1/members/', MemberListView.as_view(), name='members'),
    path('api/v1/member/add/', AddMembershipAPI.as_view(), name='members'),
    path('api/v1/usersearch/', SearchUserListAPI.as_view(), name='add_memeber'),
    path('api/v1/get-files/', GetFilesAPI.as_view(), name='add_memeber'),
    path('api/v1/remove-user/', UserRemoveAPIView, name='remove_memeber'),
    path('', home, name='home'),
    # path('chat/groups/', ChatGroupView.as_view(), name='chat_groups'),
    # path('chat/<int:pk>/group/', ChatGroupDetailview.as_view(), name='chat_group'),
    # path(
    #     'chat/messages/',
    #     ChatGroupMessageView.as_view(),
    #     name='chat_group_messages',
    # ),
    # path(
    #     'chat/<str:group_name>/messages/',
    #     ChatGroupMessageView.as_view(),
    #     name='chat_group_name_messages',
    # ),
    # path(
    #     'chat/<int:pk>/message/',
    #     ChatGroupMessageDetailView.as_view(),
    #     name='chat_group_message',
    # ),
    # path('group/', group_view, name='groups'),
    # path(
    #     '',
    #     login_required(TemplateView.as_view(template_name='core/chat.html')),
    #     name='home',
    # ),
]
