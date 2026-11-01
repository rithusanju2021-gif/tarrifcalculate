from rest_framework import serializers
from .models import OneDayTrip, MultiDayTour


class OneDayTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = OneDayTrip
        fields = '__all__'


class MultiDayTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = MultiDayTour
        fields = '__all__'
