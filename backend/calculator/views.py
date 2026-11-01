from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .engine import calculate_daily_rental, calculate_multiday_tour


class CalculateOneDayView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        try:
            res = calculate_daily_rental(
                actual_km=data.get('actual_km', 0),
                day_rent=data.get('day_rent', 0),
                fuel_cost_per_km=data.get('fuel_cost_per_km', 0),
                included_km=data.get('included_km', 250),
                km_rate=data.get('km_rate', 0),
                driver_bata=data.get('driver_bata', 0),
                pricing_method=data.get('pricing_method'),
            )
            return Response(res)
        except Exception as e:
            return Response({'detail': f'Calculation error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class CalculateMultiDayView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        days = request.data.get('days', [])
        if not days:
            return Response({'detail': 'No days provided for calculation.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            res = calculate_multiday_tour(days)
            return Response(res)
        except Exception as e:
            return Response({'detail': f'Calculation error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
