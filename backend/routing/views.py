from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from decimal import Decimal
from .services import geocode_search, calculate_road_distance, POPULAR_DESTINATIONS
from .models import RouteCache


class GeocodeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            # Return top popular South India destinations for quick selection
            return Response(POPULAR_DESTINATIONS[:15])
        results = geocode_search(query)
        return Response(results)


class RouteLegView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        try:
            lat1 = data['lat1']
            lng1 = data['lng1']
            lat2 = data['lat2']
            lng2 = data['lng2']
        except KeyError as e:
            return Response({'detail': f'Missing field: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        origin_name = data.get('origin_name', '')
        dest_name = data.get('dest_name', '')

        result = calculate_road_distance(lat1, lng1, lat2, lng2, origin_name, dest_name)
        if result:
            return Response(result)

        return Response({
            'detail': 'Road distance unavailable from routing service. Please enter manually.',
            'error_code': 'ROUTING_UNAVAILABLE',
            'origin_name': origin_name,
            'dest_name': dest_name,
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class MultiRouteView(APIView):
    """
    Calculates consecutive road legs for an itinerary.
    stops = [{'name': 'Chennai', 'lat': 13.08, 'lng': 80.27}, ...]
    include_return = True / False
    """
    permission_classes = [AllowAny]

    def post(self, request):
        stops = request.data.get('stops', [])
        include_return = request.data.get('include_return', False)

        if len(stops) < 2:
            return Response({'detail': 'At least 2 locations are required.'}, status=status.HTTP_400_BAD_REQUEST)

        legs = []
        total_km = 0.0
        total_duration_min = 0.0
        has_manual = False
        has_error = False

        # Build list of legs
        pairs = []
        for i in range(len(stops) - 1):
            pairs.append((stops[i], stops[i + 1]))

        if include_return and len(stops) >= 2:
            pairs.append((stops[-1], stops[0]))

        for from_stop, to_stop in pairs:
            # Check if user already supplied manual distance for this leg
            manual_km = to_stop.get('manual_km')
            if manual_km is not None and float(manual_km) >= 0:
                leg_km = round(float(manual_km), 2)
                leg_dur = round(leg_km * 1.5, 1)  # approx 40 km/h in Indian road conditions
                legs.append({
                    'from': from_stop.get('name', 'Stop'),
                    'to': to_stop.get('name', 'Stop'),
                    'from_lat': from_stop.get('lat'),
                    'from_lng': from_stop.get('lng'),
                    'to_lat': to_stop.get('lat'),
                    'to_lng': to_stop.get('lng'),
                    'distance_km': leg_km,
                    'duration_min': leg_dur,
                    'source': 'MANUAL',
                    'success': True
                })
                total_km += leg_km
                total_duration_min += leg_dur
                has_manual = True
                continue

            lat1 = from_stop.get('lat')
            lng1 = from_stop.get('lng')
            lat2 = to_stop.get('lat')
            lng2 = to_stop.get('lng')

            if lat1 is None or lng1 is None or lat2 is None or lng2 is None:
                legs.append({
                    'from': from_stop.get('name', 'Stop'),
                    'to': to_stop.get('name', 'Stop'),
                    'distance_km': 0.0,
                    'duration_min': 0.0,
                    'source': 'UNAVAILABLE',
                    'success': False,
                    'error': 'Missing coordinates'
                })
                has_error = True
                continue

            res = calculate_road_distance(
                lat1, lng1, lat2, lng2,
                origin_name=from_stop.get('name', ''),
                dest_name=to_stop.get('name', '')
            )

            if res:
                legs.append({
                    'from': from_stop.get('name', 'Stop'),
                    'to': to_stop.get('name', 'Stop'),
                    'from_lat': lat1,
                    'from_lng': lng1,
                    'to_lat': lat2,
                    'to_lng': lng2,
                    'distance_km': res['distance_km'],
                    'duration_min': res['duration_min'],
                    'source': res['source'],
                    'success': True
                })
                total_km += res['distance_km']
                total_duration_min += res['duration_min']
            else:
                legs.append({
                    'from': from_stop.get('name', 'Stop'),
                    'to': to_stop.get('name', 'Stop'),
                    'from_lat': lat1,
                    'from_lng': lng1,
                    'to_lat': lat2,
                    'to_lng': lng2,
                    'distance_km': 0.0,
                    'duration_min': 0.0,
                    'source': 'UNAVAILABLE',
                    'success': False,
                    'error': 'Routing service unavailable. Please enter manual distance.'
                })
                has_error = True

        overall_source = 'MANUAL' if has_manual else ('MIXED' if any(l['source'] == 'CACHED' for l in legs) and any(l['source'] == 'LIVE' for l in legs) else ('CACHED' if all(l['source'] == 'CACHED' for l in legs) else 'LIVE'))

        return Response({
            'legs': legs,
            'total_km': round(total_km, 2),
            'total_duration_min': round(total_duration_min, 1),
            'source': overall_source,
            'has_error': has_error,
            'legs_count': len(legs),
        })


class ManualDistanceView(APIView):
    """
    Saves a manual distance correction into RouteCache so future calculations can reuse it with source='MANUAL'.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        try:
            lat1 = float(data['lat1'])
            lng1 = float(data['lng1'])
            lat2 = float(data['lat2'])
            lng2 = float(data['lng2'])
            distance_km = Decimal(str(data['distance_km']))
        except (KeyError, ValueError) as e:
            return Response({'detail': f'Invalid data: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        origin_name = data.get('origin_name', '')
        dest_name = data.get('dest_name', '')
        duration_min = Decimal(str(data.get('duration_min', round(float(distance_km) * 1.5, 1))))

        route, created = RouteCache.objects.update_or_create(
            origin_lat=Decimal(f"{lat1:.6f}"),
            origin_lng=Decimal(f"{lng1:.6f}"),
            dest_lat=Decimal(f"{lat2:.6f}"),
            dest_lng=Decimal(f"{lng2:.6f}"),
            defaults={
                'origin_name': origin_name,
                'dest_name': dest_name,
                'distance_km': distance_km,
                'duration_min': duration_min,
                'source': 'MANUAL',
            }
        )

        return Response({
            'detail': 'Manual distance saved successfully.',
            'distance_km': float(route.distance_km),
            'source': 'MANUAL'
        })
