from django.db import models
from decimal import Decimal


class OneDayTrip(models.Model):
    name = models.CharField(max_length=255, default="One-Day Sightseeing Trip")
    vehicle_name = models.CharField(max_length=120, blank=True, default="")
    vehicle_id = models.IntegerField(null=True, blank=True)
    stops = models.JSONField(default=list, help_text="List of stops with name, lat, lng, manual_km")
    include_return = models.BooleanField(default=True)
    legs = models.JSONField(default=list, help_text="Calculated route legs with distances, times, and sources")
    actual_km = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    pricing_method = models.IntegerField(null=True, blank=True, help_text="None for Auto, 1 for Method 1, 2 for Method 2")
    applied_method = models.IntegerField(default=1)
    tariff_snapshot = models.JSONField(default=dict, help_text="day_rent, fuel_cost_per_km, included_km, km_rate, driver_bata")
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} - ₹{self.total_cost:.2f}"


class MultiDayTour(models.Model):
    name = models.CharField(max_length=255, default="South India Tour Itinerary")
    vehicle_name = models.CharField(max_length=120, blank=True, default="")
    vehicle_id = models.IntegerField(null=True, blank=True)
    total_km = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    days_count = models.PositiveIntegerField(default=1)
    days_data = models.JSONField(default=list, help_text="Array of days with stops, legs, halts, tariffs, costs")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} ({self.days_count} Days) - ₹{self.total_cost:.2f}"
