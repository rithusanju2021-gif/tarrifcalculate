from django.db import models
from decimal import Decimal


class Vehicle(models.Model):
    name = models.CharField(max_length=120, unique=True, help_text="e.g. Swift Dzire, Innova Crysta, Tempo Traveller 12-seater")
    vehicle_type = models.CharField(max_length=80, blank=True, default="Sedan", help_text="Sedan, SUV, Luxury SUV, Van, Minibus")
    seating_capacity = models.PositiveIntegerField(default=4)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class VehicleTariff(models.Model):
    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='tariff')
    day_rent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), help_text="Daily vehicle rent in INR")
    fuel_cost_per_km = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), help_text="Fuel cost per km in INR")
    included_km = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('250.00'), help_text="Configurable included km limit per day (e.g. 200, 250, 300, 350, 400)")
    km_rate = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), help_text="KM rate for alternative / exceeded-distance calculation in INR")
    driver_bata = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), help_text="Driver bata per day in INR")
    notes = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Tariff for {self.vehicle.name}"
