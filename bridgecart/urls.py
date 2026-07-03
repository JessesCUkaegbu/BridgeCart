from django.conf import settings
from django.contrib import admin
from django.contrib.staticfiles.views import serve as static_serve
from django.urls import include, path
from django.urls import re_path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("app.urls")),
]

# Serve local static assets directly when Django is running without the
# built-in debug static handler.
if not settings.DEBUG:
    urlpatterns += [
        re_path(r"^static/(?P<path>.*)$", static_serve, {"insecure": True}),
    ]
