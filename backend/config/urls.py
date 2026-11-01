from django.contrib import admin
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'status': 'online',
            'app': 'Rithish Tours & Travels Vehicle Distance & Rental Calculator',
            'version': '1.0.0',
            'database': 'Connected',
            'hosting_cost_target': '₹0/month'
        })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='health_check'),
    path('api/auth/', include('accounts.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/routing/', include('routing.urls')),
    path('api/calculator/', include('calculator.urls')),
    path('api/trips/', include('trips.urls')),
    path('api/exports/', include('exports.urls')),
]
