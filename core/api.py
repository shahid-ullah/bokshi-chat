# core/api.py

# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, mixins, parsers, status, viewsets
from rest_framework.authentication import (SessionAuthentication,
                                           TokenAuthentication)
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from chat import settings
from core.models import ChatGroup, ChatGroupMessage, MessageModel, Relationship
from core.serializers import (ChatGroupDetailSerializer,
                              ChatGroupMessageDetailSerializer,
                              ChatGroupMessageSerializer, ChatGroupSerializer,
                              FileSerializer, MessageModelSerializer,
                              RelationshipModelSerializer,
                              RemoveUserSerializer, UserModelSerializer)

User = get_user_model()


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication scheme used by DRF. DRF's SessionAuthentication uses
    Django's session framework for authentication which requires CSRF to be
    checked. In this case we are going to disable CSRF tokens for the API.
    """

    def enforce_csrf(self, request):
        return


class MessagePagination(PageNumberPagination):
    """
    Limit message prefetch to one page.
    """

    page_size = settings.MESSAGES_TO_LOAD


class MessageModelViewSet(ModelViewSet):
    queryset = MessageModel.objects.all()
    serializer_class = MessageModelSerializer
    parser_classes = [parsers.FormParser, parsers.MultiPartParser]
    allowed_methods = ('GET', 'POST', 'HEAD', 'OPTIONS')
    authentication_classes = (
        CsrfExemptSessionAuthentication,
        TokenAuthentication,
    )
    # authentication_classes = (CsrfExemptSessionAuthentication,)
    pagination_class = MessagePagination

    def list(self, request, *args, **kwargs):
        # breakpoint()
        self.queryset = self.queryset.filter(
            Q(recipient=request.user) | Q(user=request.user)
        )
        target = self.request.query_params.get('target', None)
        # if group_name is not None:
        #     self.queryset = self.queryset.filter()
        if target is not None:
            self.queryset = self.queryset.filter(
                Q(recipient=request.user, user__username=target)
                | Q(recipient__username=target, user=request.user)
            )
        return super(MessageModelViewSet, self).list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        msg = get_object_or_404(
            self.queryset.filter(
                Q(recipient=request.user) | Q(user=request.user), Q(pk=kwargs['pk'])
            )
        )
        serializer = self.get_serializer(msg)
        return Response(serializer.data)


class UserModelViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserModelSerializer
    allowed_methods = ('GET', 'HEAD', 'OPTIONS')
    pagination_class = None  # Get all user

    def list(self, request, *args, **kwargs):
        # Get all users except yourself
        self.queryset = self.queryset.exclude(id=request.user.id)
        return super(UserModelViewSet, self).list(request, *args, **kwargs)


class ChatGroupView(
    mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView
):
    queryset = ChatGroup.objects.all()
    serializer_class = ChatGroupSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class ChatGroupDetailview(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    queryset = ChatGroup.objects.all()
    serializer_class = ChatGroupDetailSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class ChatGroupMessageView(
    mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView
):
    queryset = ChatGroupMessage.objects.all()
    serializer_class = ChatGroupMessageSerializer

    def get(self, request, *args, **kwargs):
        group_name = self.kwargs.get('group_name', None)
        # print(group_name)
        # if group_name is not None:
        #     self.queryset = self.get_queryset().filter(group_name=group_name)
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class ChatGroupMessageDetailView(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):

    queryset = ChatGroupMessage.objects.all()
    serializer_class = ChatGroupMessageDetailSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class MemberListView(mixins.ListModelMixin, generics.GenericAPIView):

    queryset = User.objects.all()
    serializer_class = UserModelSerializer
    pagination_class = None  # Get all user

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        # breakpoint()
        friends = request.user.friend_list.values('friend').distinct()
        friend_ids = [fr.get('friend') for fr in friends]
        self.queryset = self.queryset.filter(id__in=friend_ids)
        self.queryset = self.queryset.exclude(id=request.user.id)
        return super(MemberListView, self).list(request, *args, **kwargs)


class AddMembershipAPI(mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = Relationship.objects.all()
    serializer_class = RelationshipModelSerializer
    pagination_class = None  # Get all user
    authentication_classes = (
        CsrfExemptSessionAuthentication,
        TokenAuthentication,
    )

    def post(self, request, *args, **kwargs):
        # breakpoint()
        creator_id = request.POST.get('creator', None)
        friend_id = request.POST.get('friend', None)

        # check friendship creation with same user
        if creator_id is not None and friend_id is not None:
            if creator_id == friend_id:
                return Response(
                    'same user',
                    status=status.HTTP_200_OK,
                )
        # check existing friendship
        try:
            if friend_id is not None:
                friend_id = int(friend_id)
                query_result = Relationship.objects.filter(
                    creator_id=request.user.id, friend__id=friend_id
                )
                if query_result:
                    return Response(
                        'Already user exists', status=status.HTTP_201_CREATED
                    )
        except Exception as e:
            pass

        # create reverse friendship > friend to me
        if friend_id is not None:
            try:
                creator = self.request.user
                friend = User.objects.get(id=friend_id)
                Relationship.objects.create(creator=friend, friend=creator)
            except Exception as e:
                pass
        # breakpoint()
        return self.create(request, *args, **kwargs)


class SearchUserListAPI(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = User.objects.all()
    serializer_class = UserModelSerializer
    pagination_class = None

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        query_text = self.request.query_params.get('username', None)
        if query_text is not None:
            self.queryset = self.queryset.filter(username=query_text)
        self.queryset = self.queryset.exclude(id=request.user.id)
        return super(SearchUserListAPI, self).list(request, *args, **kwargs)


class GetFilesAPI(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = MessageModel.objects.values_list('files')
    queryset = MessageModel.objects.all()
    serializer_class = FileSerializer
    parser_classes = [parsers.FormParser, parsers.MultiPartParser]
    allowed_methods = 'GET'
    authentication_classes = (
        CsrfExemptSessionAuthentication,
        TokenAuthentication,
    )
    # authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        self.queryset = self.queryset.filter(
            Q(recipient=request.user) | Q(user=request.user)
        )
        target = self.request.query_params.get('target', None)
        # if group_name is not None:
        #     self.queryset = self.queryset.filter()
        if target is not None:
            self.queryset = self.queryset.filter(
                Q(recipient=request.user, user__username=target)
                | Q(recipient__username=target, user=request.user)
            )
        return super(GetFilesAPI, self).list(request, *args, **kwargs)


# class UserRemoveAPIView(generics.DestroyAPIView):
#     queryset = Relationship.objects.filter(creator_id=1)
#     serializer_class = RemoveUserSerializer
#     authentication_classes = (
#         CsrfExemptSessionAuthentication,
#         TokenAuthentication,
#     )
#     lookup_field = "creator_id"


@api_view(['POST'])
@authentication_classes(
    [
        CsrfExemptSessionAuthentication,
        TokenAuthentication,
    ]
)
def UserRemoveAPIView(request):
    if request.method == 'POST':
        creator = request.POST['creator']
        friend = request.POST['friend']
        if creator is not None and friend is not None:
            creatorObject = User.objects.get(username=creator)
            friendObject = User.objects.get(username=friend)
            Relationship.objects.filter(creator_id=creatorObject.id).filter(
                friend_id=friendObject.id
            ).delete()
            # MessageModel.objects.filter(user_id=creatorObject.id).filter(
            #     recipient_id=friendObject.id
            # ).delete()
            # MessageModel.objects.filter(recipient_id=creatorObject.id).filter(
            #     user_id=friendObject.id
            # ).delete()

        return Response({})

    return Response({})
