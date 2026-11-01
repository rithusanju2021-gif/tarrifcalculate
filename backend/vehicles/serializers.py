from rest_framework import serializers
from .models import Vehicle, VehicleTariff


class VehicleTariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleTariff
        fields = [
            'id', 'vehicle', 'day_rent', 'fuel_cost_per_km',
            'included_km', 'km_rate', 'driver_bata', 'notes', 'updated_at'
        ]
        read_only_fields = ['id', 'vehicle', 'updated_at']


class VehicleSerializer(serializers.ModelSerializer):
    tariff = VehicleTariffSerializer(read_only=True)
    # Allow passing tariff fields directly during vehicle creation/update
    day_rent = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    fuel_cost_per_km = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    included_km = serializers.DecimalField(max_digits=8, decimal_places=2, required=False, write_only=True)
    km_rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    driver_bata = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'name', 'vehicle_type', 'seating_capacity', 'is_active',
            'sort_order', 'created_at', 'updated_at', 'tariff',
            'day_rent', 'fuel_cost_per_km', 'included_km', 'km_rate', 'driver_bata'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        day_rent = validated_data.pop('day_rent', 0)
        fuel_cost_per_km = validated_data.pop('fuel_cost_per_km', 0)
        included_km = validated_data.pop('included_km', 250)
        km_rate = validated_data.pop('km_rate', 0)
        driver_bata = validated_data.pop('driver_bata', 0)

        vehicle = Vehicle.objects.create(**validated_data)
        VehicleTariff.objects.create(
            vehicle=vehicle,
            day_rent=day_rent,
            fuel_cost_per_km=fuel_cost_per_km,
            included_km=included_km,
            km_rate=km_rate,
            driver_bata=driver_bata,
        )
        return vehicle

    def update(self, instance, validated_data):
        day_rent = validated_data.pop('day_rent', None)
        fuel_cost_per_km = validated_data.pop('fuel_cost_per_km', None)
        included_km = validated_data.pop('included_km', None)
        km_rate = validated_data.pop('km_rate', None)
        driver_bata = validated_data.pop('driver_bata', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create tariff if fields were provided
        tariff, _ = VehicleTariff.objects.get_or_create(vehicle=instance)
        if day_rent is not None:
            tariff.day_rent = day_rent
        if fuel_cost_per_km is not None:
            tariff.fuel_cost_per_km = fuel_cost_per_km
        if included_km is not None:
            tariff.included_km = included_km
        if km_rate is not None:
            tariff.km_rate = km_rate
        if driver_bata is not None:
            tariff.driver_bata = driver_bata
        tariff.save()

        return instance
