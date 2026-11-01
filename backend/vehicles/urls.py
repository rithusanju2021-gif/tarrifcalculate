from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, VehicleTariffDetailView

router = DefaultRouter()
router.register(r'', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('<int:vehicle_id>/tariff/', VehicleTariffDetailView.as_view(), name='vehicle_tariff'),
    path('', include(router.urls)),
]
