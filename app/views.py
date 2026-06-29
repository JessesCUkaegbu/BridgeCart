from django.shortcuts import render

from .models import Product


def home(request):
    products = Product.objects.filter(is_active=True)
    categories = products.order_by("category").values_list("category", flat=True).distinct()
    return render(request, "app/index.html", {"products": products, "categories": categories})
