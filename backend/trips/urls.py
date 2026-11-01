from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OneDayTripViewSet, MultiDayTourViewSet

router = DefaultRouter()
router.register(r'oneday', OneDayTripViewSet, basename='trip_oneday')
router.register(r'multiday', MultiDayTourViewSet, basename='trip_multiday')

urlpatterns = [
    path('', include(router.urls)),
]
