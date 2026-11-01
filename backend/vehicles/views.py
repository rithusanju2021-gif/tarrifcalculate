from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Vehicle, VehicleTariff
from .serializers import VehicleSerializer, VehicleTariffSerializer
from decimal import Decimal


DEFAULT_VEHICLES_SEED = [
    {"name": "Swift Dzire", "vehicle_type": "Sedan", "seating_capacity": 4, "sort_order": 1, "day_rent": 2200, "fuel_cost_per_km": 11, "included_km": 250, "km_rate": 13, "driver_bata": 400},
    {"name": "Toyota Etios", "vehicle_type": "Sedan", "seating_capacity": 4, "sort_order": 2, "day_rent": 2400, "fuel_cost_per_km": 12, "included_km": 250, "km_rate": 14, "driver_bata": 400},
    {"name": "Maruti Ertiga", "vehicle_type": "SUV", "seating_capacity": 6, "sort_order": 3, "day_rent": 3000, "fuel_cost_per_km": 14, "included_km": 250, "km_rate": 16, "driver_bata": 500},
    {"name": "Toyota Innova", "vehicle_type": "SUV", "seating_capacity": 7, "sort_order": 4, "day_rent": 3800, "fuel_cost_per_km": 16, "included_km": 300, "km_rate": 19, "driver_bata": 500},
    {"name": "Toyota Innova Crysta", "vehicle_type": "Luxury SUV", "seating_capacity": 7, "sort_order": 5, "day_rent": 4500, "fuel_cost_per_km": 18, "included_km": 300, "km_rate": 22, "driver_bata": 600},
    {"name": "Tempo Traveller 12-seater", "vehicle_type": "Van", "seating_capacity": 12, "sort_order": 6, "day_rent": 5500, "fuel_cost_per_km": 22, "included_km": 300, "km_rate": 26, "driver_bata": 700},
    {"name": "Tempo Traveller 17-seater", "vehicle_type": "Minibus", "seating_capacity": 17, "sort_order": 7, "day_rent": 6500, "fuel_cost_per_km": 25, "included_km": 300, "km_rate": 30, "driver_bata": 800},
    {"name": "Force Urbania", "vehicle_type": "Luxury Minibus", "seating_capacity": 12, "sort_order": 8, "day_rent": 7500, "fuel_cost_per_km": 28, "included_km": 300, "km_rate": 34, "driver_bata": 900},
]


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [AllowAny]  # Read/write enabled for staff internal tool; JWT protected if passed

    def get_queryset(self):
        queryset = Vehicle.objects.all().select_related('tariff')
        include_inactive = self.request.query_params.get('all', 'false').lower() == 'true'
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        return queryset

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        vehicle = self.get_object()
        vehicle.is_active = not vehicle.is_active
        vehicle.save()
        return Response({'id': vehicle.id, 'name': vehicle.name, 'is_active': vehicle.is_active})

    @action(detail=False, methods=['post'])
    def seed_defaults(self, request):
        created_count = 0
        for item in DEFAULT_VEHICLES_SEED:
            v, created = Vehicle.objects.get_or_create(
                name=item['name'],
                defaults={
                    'vehicle_type': item['vehicle_type'],
                    'seating_capacity': item['seating_capacity'],
                    'sort_order': item['sort_order'],
                    'is_active': True,
                }
            )
            VehicleTariff.objects.get_or_create(
                vehicle=v,
                defaults={
                    'day_rent': Decimal(str(item['day_rent'])),
                    'fuel_cost_per_km': Decimal(str(item['fuel_cost_per_km'])),
                    'included_km': Decimal(str(item['included_km'])),
                    'km_rate': Decimal(str(item['km_rate'])),
                    'driver_bata': Decimal(str(item['driver_bata'])),
                }
            )
            if created:
                created_count += 1
        return Response({'detail': f'Seeded {created_count} default vehicles successfully.'})


class VehicleTariffDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vehicle_id):
        try:
            tariff = VehicleTariff.objects.get(vehicle_id=vehicle_id)
            return Response(VehicleTariffSerializer(tariff).data)
        except VehicleTariff.DoesNotExist:
            return Response({'detail': 'Tariff not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, vehicle_id):
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
            tariff, _ = VehicleTariff.objects.get_or_create(vehicle=vehicle)
            serializer = VehicleTariffSerializer(tariff, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Vehicle.DoesNotExist:
            return Response({'detail': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)
