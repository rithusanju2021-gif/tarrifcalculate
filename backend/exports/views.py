from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from .pdf_generator import generate_itinerary_pdf
from vehicles.models import Vehicle, VehicleTariff
from trips.models import OneDayTrip, MultiDayTour
from routing.models import RouteCache
from decimal import Decimal
import json


class ExportPDFView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        title = data.get('title', 'Tour Itinerary & Quotation')
        vehicle_name = data.get('vehicle_name', 'Tourist Vehicle')
        total_km = float(data.get('total_km', 0.0))
        total_cost = float(data.get('total_cost', 0.0))
        is_multiday = bool(data.get('is_multiday', False))
        days_or_legs = data.get('details', {})

        try:
            pdf_bytes = generate_itinerary_pdf(
                title=title,
                vehicle_name=vehicle_name,
                total_km=total_km,
                total_cost=total_cost,
                days_or_legs=days_or_legs,
                is_multiday=is_multiday
            )
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            safe_filename = title.replace(' ', '_').replace('/', '_')[:40]
            response['Content-Disposition'] = f'attachment; filename="RTT_{safe_filename}.pdf"'
            return response
        except Exception as e:
            return Response({'detail': f'PDF generation failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WhatsAppFormatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        title = data.get('title', 'South India Tour Itinerary')
        vehicle_name = data.get('vehicle_name', 'Tourist Vehicle')
        total_km = float(data.get('total_km', 0.0))
        total_cost = float(data.get('total_cost', 0.0))
        is_multiday = bool(data.get('is_multiday', False))
        details = data.get('details', {})

        lines = [
            "✨ *RITHISH TOURS & TRAVELS* ✨",
            "📞 *Official Vehicle Rental & Tour Quotation*",
            "🌐 _rithishtoursandtravels.in_",
            "──────────────────────",
            f"📋 *Trip:* {title}",
            f"🚗 *Vehicle:* {vehicle_name}",
            f"🛣️ *Total Distance:* {total_km:.2f} km",
            "──────────────────────"
        ]

        if not is_multiday:
            legs = details.get('legs', [])
            if legs:
                lines.append("📍 *Route & Sightseeing Stops:*")
                for i, leg in enumerate(legs, 1):
                    lines.append(f"  {i}. {leg.get('from')} ➔ {leg.get('to')} ({leg.get('distance_km', 0):.1f} km, ~{leg.get('duration_min', 0):.0f} min)")
                lines.append("")

            applied_method = details.get('applied_method', 1)
            tariff = details.get('tariff', {})
            lines.append(f"💳 *Applied Tariff:* Method {applied_method}")
            lines.append(f"• Day Rent: ₹{tariff.get('day_rent', 0):,.2f}")
            lines.append(f"• Fuel Rate: ₹{tariff.get('fuel_cost_per_km', 0)} / km")
            lines.append(f"• Included Limit: {tariff.get('included_km', 250)} km/day")
            lines.append(f"• KM Rate (Method 2): ₹{tariff.get('km_rate', 0)} / km")
            lines.append(f"• Driver Bata: ₹{tariff.get('driver_bata', 0):,.2f}")
        else:
            days = details.get('days', [])
            lines.append("🗓️ *Day-Wise Tour Itinerary:*")
            for day in days:
                d_num = day.get('day_number', 1)
                stops_str = " ➔ ".join([s.get('name', '') for s in day.get('stops', []) if s.get('name')])
                halt = f" [Halt: {day.get('overnight_halt')}]" if day.get('overnight_halt') else ""
                lines.append(f"*Day {d_num}:* {stops_str}{halt}")
                lines.append(f"   Distance: {day.get('actual_km', 0):.1f} km | Method {day.get('applied_method', 1)} | Cost: ₹{day.get('total_cost', 0):,.2f}")

        lines.extend([
            "──────────────────────",
            f"💰 *TOTAL ESTIMATE: ₹{total_cost:,.2f}*",
            "──────────────────────",
            "ℹ️ _Note: Toll charges, parking, interstate permits & GST extra at actuals._",
            "🙏 _Thank you for choosing Rithish Tours & Travels!_"
        ])

        formatted_text = "\n".join(lines)
        return Response({'text': formatted_text})


class BackupExportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        vehicles_data = []
        for v in Vehicle.objects.all():
            v_dict = {
                'name': v.name,
                'vehicle_type': v.vehicle_type,
                'seating_capacity': v.seating_capacity,
                'is_active': v.is_active,
                'sort_order': v.sort_order,
            }
            if hasattr(v, 'tariff'):
                t = v.tariff
                v_dict['tariff'] = {
                    'day_rent': float(t.day_rent),
                    'fuel_cost_per_km': float(t.fuel_cost_per_km),
                    'included_km': float(t.included_km),
                    'km_rate': float(t.km_rate),
                    'driver_bata': float(t.driver_bata),
                    'notes': t.notes,
                }
            vehicles_data.append(v_dict)

        oneday_trips = list(OneDayTrip.objects.all().values())
        for trip in oneday_trips:
            # Format decimals
            trip['actual_km'] = float(trip['actual_km'])
            trip['total_cost'] = float(trip['total_cost'])
            trip['created_at'] = str(trip['created_at'])
            trip['updated_at'] = str(trip['updated_at'])

        multiday_tours = list(MultiDayTour.objects.all().values())
        for tour in multiday_tours:
            tour['total_km'] = float(tour['total_km'])
            tour['total_cost'] = float(tour['total_cost'])
            tour['created_at'] = str(tour['created_at'])
            tour['updated_at'] = str(tour['updated_at'])

        backup_payload = {
            'app': 'Rithish Tours & Travels Vehicle Calculator',
            'version': '1.0',
            'exported_at': str(request._request.build_absolute_uri()),
            'vehicles': vehicles_data,
            'oneday_trips': oneday_trips,
            'multiday_tours': multiday_tours,
        }

        return Response(backup_payload)


class BackupImportView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        if not isinstance(data, dict):
            return Response({'detail': 'Invalid backup format.'}, status=status.HTTP_400_BAD_REQUEST)

        vehicles = data.get('vehicles', [])
        restored_v = 0
        for v_data in vehicles:
            v_name = v_data.get('name')
            if not v_name:
                continue
            v, _ = Vehicle.objects.update_or_create(
                name=v_name,
                defaults={
                    'vehicle_type': v_data.get('vehicle_type', 'Sedan'),
                    'seating_capacity': v_data.get('seating_capacity', 4),
                    'is_active': v_data.get('is_active', True),
                    'sort_order': v_data.get('sort_order', 0),
                }
            )
            t_data = v_data.get('tariff', {})
            VehicleTariff.objects.update_or_create(
                vehicle=v,
                defaults={
                    'day_rent': Decimal(str(t_data.get('day_rent', 0))),
                    'fuel_cost_per_km': Decimal(str(t_data.get('fuel_cost_per_km', 0))),
                    'included_km': Decimal(str(t_data.get('included_km', 250))),
                    'km_rate': Decimal(str(t_data.get('km_rate', 0))),
                    'driver_bata': Decimal(str(t_data.get('driver_bata', 0))),
                    'notes': t_data.get('notes', ''),
                }
            )
            restored_v += 1

        return Response({
            'detail': f'Backup imported successfully! Restored {restored_v} vehicles with tariffs.'
        })


class ClearAllDataView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        confirm = request.data.get('confirm')
        if confirm != 'CONFIRM_CLEAR_ALL':
            return Response({'detail': 'Confirmation token mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

        OneDayTrip.objects.all().delete()
        MultiDayTour.objects.all().delete()
        RouteCache.objects.all().delete()

        return Response({'detail': 'All saved itineraries, tours, and cached distances have been cleared.'})
