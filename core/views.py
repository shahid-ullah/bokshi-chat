# core/views.py
from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def home(request):
    return render(request, 'core/index.html')


def group_view(request):
    return render(request, 'core/gc.html')
