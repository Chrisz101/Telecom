from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StateViewSet, CountyViewSet, DisasterViewSet, HospitalViewSet, ResourceViewSet

router = DefaultRouter()
router.register(r'states', StateViewSet)
router.register(r'counties', CountyViewSet)
router.register(r'disasters', DisasterViewSet)
router.register(r'hospitals', HospitalViewSet)
router.register(r'resources', ResourceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
