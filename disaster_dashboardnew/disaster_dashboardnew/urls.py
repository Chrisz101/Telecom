# disaster_dashboardnew/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from core import views

router = routers.DefaultRouter()
router.register(r'states', views.StateViewSet)
router.register(r'counties', views.CountyViewSet)
router.register(r'disasters', views.DisasterViewSet)
router.register(r'hospitals', views.HospitalViewSet)
router.register(r'resources', views.ResourceViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
