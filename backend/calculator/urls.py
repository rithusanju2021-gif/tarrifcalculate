from django.urls import path
from .views import CalculateOneDayView, CalculateMultiDayView

urlpatterns = [
    path('oneday/', CalculateOneDayView.as_view(), name='calculate_oneday'),
    path('multiday/', CalculateMultiDayView.as_view(), name='calculate_multiday'),
]
