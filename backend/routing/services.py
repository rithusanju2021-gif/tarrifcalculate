import requests
from decimal import Decimal
from django.db.models import Q
from .models import RouteCache

# Top South India & Indian tourist destinations for instant local fallback
POPULAR_DESTINATIONS = [
    # Tamil Nadu
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"name": "Mahabalipuram", "state": "Tamil Nadu", "lat": 12.6269, "lng": 80.1927},
    {"name": "Kanchipuram", "state": "Tamil Nadu", "lat": 12.8342, "lng": 79.7036},
    {"name": "Puducherry (Pondicherry)", "state": "Puducherry", "lat": 11.9416, "lng": 79.8083},
    {"name": "Vellore (Golden Temple)", "state": "Tamil Nadu", "lat": 12.9165, "lng": 79.1325},
    {"name": "Tiruvannamalai", "state": "Tamil Nadu", "lat": 12.2253, "lng": 79.0747},
    {"name": "Chidambaram", "state": "Tamil Nadu", "lat": 11.3992, "lng": 79.6935},
    {"name": "Thanjavur (Brihadeeswara)", "state": "Tamil Nadu", "lat": 10.7870, "lng": 79.1378},
    {"name": "Kumbakonam", "state": "Tamil Nadu", "lat": 10.9602, "lng": 79.3845},
    {"name": "Trichy (Tiruchirappalli)", "state": "Tamil Nadu", "lat": 10.7905, "lng": 78.7047},
    {"name": "Madurai (Meenakshi Amman)", "state": "Tamil Nadu", "lat": 9.9252, "lng": 78.1198},
    {"name": "Rameswaram", "state": "Tamil Nadu", "lat": 9.2876, "lng": 79.3129},
    {"name": "Dhanushkodi", "state": "Tamil Nadu", "lat": 9.1772, "lng": 79.4184},
    {"name": "Kanyakumari", "state": "Tamil Nadu", "lat": 8.0883, "lng": 77.5385},
    {"name": "Kodaikanal", "state": "Tamil Nadu", "lat": 10.2381, "lng": 77.4892},
    {"name": "Ooty (Udhagamandalam)", "state": "Tamil Nadu", "lat": 11.4102, "lng": 76.6950},
    {"name": "Coonoor", "state": "Tamil Nadu", "lat": 11.3530, "lng": 76.7959},
    {"name": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lng": 76.9558},
    {"name": "Yercaud", "state": "Tamil Nadu", "lat": 11.7753, "lng": 78.2093},
    {"name": "Courtallam", "state": "Tamil Nadu", "lat": 8.9304, "lng": 77.2694},

    # Kerala
    {"name": "Munnar", "state": "Kerala", "lat": 10.0889, "lng": 77.0595},
    {"name": "Thekkady (Periyar)", "state": "Kerala", "lat": 9.6031, "lng": 77.1615},
    {"name": "Alleppey (Alappuzha)", "state": "Kerala", "lat": 9.4981, "lng": 76.3388},
    {"name": "Kumarakom", "state": "Kerala", "lat": 9.6175, "lng": 76.4301},
    {"name": "Kochi (Cochin)", "state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    {"name": "Wayanad (Kalpetta)", "state": "Kerala", "lat": 11.6050, "lng": 76.0828},
    {"name": "Vagamon", "state": "Kerala", "lat": 9.6872, "lng": 76.9056},
    {"name": "Varkala", "state": "Kerala", "lat": 8.7379, "lng": 76.7163},
    {"name": "Kovalam", "state": "Kerala", "lat": 8.4004, "lng": 76.9787},
    {"name": "Trivandrum (Thiruvananthapuram)", "state": "Kerala", "lat": 8.5241, "lng": 76.9366},
    {"name": "Athirappilly Waterfalls", "state": "Kerala", "lat": 10.2851, "lng": 76.5698},
    {"name": "Guruvayur", "state": "Kerala", "lat": 10.5946, "lng": 76.0419},

    # Karnataka
    {"name": "Bangalore (Bengaluru)", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"name": "Mysore (Mysuru)", "state": "Karnataka", "lat": 12.2958, "lng": 76.6394},
    {"name": "Coorg (Madikeri)", "state": "Karnataka", "lat": 12.4244, "lng": 75.7382},
    {"name": "Chikmagalur", "state": "Karnataka", "lat": 13.3161, "lng": 75.7720},
    {"name": "Hampi", "state": "Karnataka", "lat": 15.3350, "lng": 76.4600},
    {"name": "Badami", "state": "Karnataka", "lat": 15.9189, "lng": 75.6768},
    {"name": "Gokarna", "state": "Karnataka", "lat": 14.5479, "lng": 74.3188},
    {"name": "Murudeshwar", "state": "Karnataka", "lat": 14.0940, "lng": 74.4899},
    {"name": "Udupi", "state": "Karnataka", "lat": 13.3409, "lng": 74.7421},
    {"name": "Mangalore", "state": "Karnataka", "lat": 12.9141, "lng": 74.8560},
    {"name": "Bandipur National Park", "state": "Karnataka", "lat": 11.6664, "lng": 76.6291},
    {"name": "Nagarhole National Park", "state": "Karnataka", "lat": 12.0314, "lng": 76.1207},

    # Andhra Pradesh & Telangana
    {"name": "Tirupati (Lord Venkateswara)", "state": "Andhra Pradesh", "lat": 13.6288, "lng": 79.4192},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "lat": 16.5062, "lng": 80.6480},
    {"name": "Visakhapatnam (Vizag)", "state": "Andhra Pradesh", "lat": 17.6868, "lng": 83.2185},
    {"name": "Araku Valley", "state": "Andhra Pradesh", "lat": 18.3273, "lng": 82.8775},
    {"name": "Srisailam", "state": "Andhra Pradesh", "lat": 16.0739, "lng": 78.8681},
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"name": "Warangal", "state": "Telangana", "lat": 17.9689, "lng": 79.5941},
]


def geocode_search(query):
    """
    Search places via Nominatim with fallback to South India popular destinations.
    """
    query = query.strip()
    if not query:
        return []

    results = []

    # Check popular destinations first for ultra-fast local match
    q_lower = query.lower()
    for dest in POPULAR_DESTINATIONS:
        if q_lower in dest['name'].lower() or q_lower in dest['state'].lower():
            results.append({
                'display_name': f"{dest['name']}, {dest['state']}, India",
                'name': dest['name'],
                'state': dest['state'],
                'lat': dest['lat'],
                'lng': dest['lng'],
                'source': 'LOCAL_DATABASE'
            })

    # Call Nominatim if fewer than 5 matches or user typed specific landmark
    try:
        headers = {
            'User-Agent': 'RithishToursPlanner/1.0 (staff@rithishtoursandtravels.in)',
            'Accept-Language': 'en'
        }
        url = 'https://nominatim.openstreetmap.org/search'
        params = {
            'q': query,
            'format': 'json',
            'countrycodes': 'in',
            'addressdetails': 1,
            'limit': 6
        }
        res = requests.get(url, params=params, headers=headers, timeout=4)
        if res.status_code == 200:
            data = res.json()
            for item in data:
                addr = item.get('address', {})
                name = item.get('name') or addr.get('city') or addr.get('town') or addr.get('village') or query
                state = addr.get('state', 'India')
                lat = float(item['lat'])
                lng = float(item['lon'])
                # Avoid duplicates
                if not any(abs(r['lat'] - lat) < 0.01 and abs(r['lng'] - lng) < 0.01 for r in results):
                    results.append({
                        'display_name': item.get('display_name'),
                        'name': name,
                        'state': state,
                        'lat': lat,
                        'lng': lng,
                        'source': 'NOMINATIM'
                    })
    except Exception:
        # Nominatim timeout or offline; fallback results already loaded
        pass

    return results[:8]


def find_cached_route(lat1, lng1, lat2, lng2, tolerance=0.005):
    """
    Look up RouteCache for a route between (lat1, lng1) and (lat2, lng2).
    tolerance ~ 0.005 degrees is approx 550 meters.
    """
    qs = RouteCache.objects.filter(
        origin_lat__gte=lat1 - tolerance,
        origin_lat__lte=lat1 + tolerance,
        origin_lng__gte=lng1 - tolerance,
        origin_lng__lte=lng1 + tolerance,
        dest_lat__gte=lat2 - tolerance,
        dest_lat__lte=lat2 + tolerance,
        dest_lng__gte=lng2 - tolerance,
        dest_lng__lte=lng2 + tolerance,
    ).order_by('-updated_at')

    route = qs.first()
    if route:
        route.hit_count += 1
        route.save(update_fields=['hit_count'])
        return {
            'distance_km': float(route.distance_km),
            'duration_min': float(route.duration_min),
            'source': 'CACHED',
            'origin_name': route.origin_name,
            'dest_name': route.dest_name,
        }
    return None


def calculate_road_distance(lat1, lng1, lat2, lng2, origin_name='', dest_name=''):
    """
    Calculates driving distance using OSRM, checking RouteCache first.
    Never invents fake distances. Returns None if routing fails.
    """
    lat1_f = float(lat1)
    lng1_f = float(lng1)
    lat2_f = float(lat2)
    lng2_f = float(lng2)

    # If coordinates are identical (same stop)
    if abs(lat1_f - lat2_f) < 0.0001 and abs(lng1_f - lng2_f) < 0.0001:
        return {
            'distance_km': 0.0,
            'duration_min': 0.0,
            'source': 'LIVE',
            'origin_name': origin_name,
            'dest_name': dest_name,
        }

    # 1. Check local DB cache
    cached = find_cached_route(lat1_f, lng1_f, lat2_f, lng2_f)
    if cached:
        return cached

    # 2. Call OSRM public API
    try:
        osrm_url = f"https://router.project-osrm.org/route/v1/driving/{lng1_f},{lat1_f};{lng2_f},{lat2_f}?overview=false"
        resp = requests.get(osrm_url, timeout=6)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('code') == 'Ok' and data.get('routes'):
                route = data['routes'][0]
                meters = route.get('distance', 0)
                seconds = route.get('duration', 0)
                km = round(meters / 1000.0, 2)
                mins = round(seconds / 60.0, 1)

                # Store in RouteCache
                RouteCache.objects.create(
                    origin_name=origin_name or f"{lat1_f:.4f},{lng1_f:.4f}",
                    origin_lat=Decimal(f"{lat1_f:.6f}"),
                    origin_lng=Decimal(f"{lng1_f:.6f}"),
                    dest_name=dest_name or f"{lat2_f:.4f},{lng2_f:.4f}",
                    dest_lat=Decimal(f"{lat2_f:.6f}"),
                    dest_lng=Decimal(f"{lng2_f:.6f}"),
                    distance_km=Decimal(f"{km:.2f}"),
                    duration_min=Decimal(f"{mins:.1f}"),
                    source='LIVE'
                )

                return {
                    'distance_km': km,
                    'duration_min': mins,
                    'source': 'LIVE',
                    'origin_name': origin_name,
                    'dest_name': dest_name,
                }
    except Exception as e:
        # Log or pass; do not invent a fake distance
        pass

    # Routing failed or service unavailable
    return None
