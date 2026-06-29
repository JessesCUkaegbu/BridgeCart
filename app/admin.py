from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "badge", "is_active", "order")
    list_filter = ("category", "badge", "is_active")
    search_fields = ("name", "description", "category")
    ordering = ("order",)
