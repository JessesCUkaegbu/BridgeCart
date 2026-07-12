from django.shortcuts import render

from .models import Product


def home(request):
    return render(request, "app/index.html")

def chat(request):
    return render(request, "app/chat.html")
