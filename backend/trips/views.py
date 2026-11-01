from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import OneDayTrip, MultiDayTour
from .serializers import OneDayTripSerializer, MultiDayTourSerializer


class OneDayTripViewSet(viewsets.ModelViewSet):
    queryset = OneDayTrip.objects.all()
    serializer_class = OneDayTripSerializer
    permission_classes = [AllowAny]


class MultiDayTourViewSet(viewsets.ModelViewSet):
    queryset = MultiDayTour.objects.all()
    serializer_class = MultiDayTourSerializer
    permission_classes = [AllowAny]
