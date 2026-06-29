from django.db import models


class Product(models.Model):
    BADGE_CHOICES = [
        ("", "None"),
        ("Hot", "Hot"),
        ("New", "New"),
        ("Sale", "Sale"),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    badge = models.CharField(max_length=10, choices=BADGE_CHOICES, blank=True, default="")
    emoji = models.CharField(max_length=4, blank=True, default="📦")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "category", "name"]

    def __str__(self):
        return f"{self.name} ({self.category})"
