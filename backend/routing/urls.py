from django.urls import path
from .views import GeocodeView, RouteLegView, MultiRouteView, ManualDistanceView

urlpatterns = [
    path('geocode/', GeocodeView.as_view(), name='routing_geocode'),
    path('leg/', RouteLegView.as_view(), name='routing_leg'),
    path('multi/', MultiRouteView.as_view(), name='routing_multi'),
    path('manual/', ManualDistanceView.as_view(), name='routing_manual'),
]
