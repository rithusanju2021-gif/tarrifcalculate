from django.db import models
from decimal import Decimal


class RouteCache(models.Model):
    SOURCE_CHOICES = [
        ('LIVE', 'Live Routing Engine'),
        ('CACHED', 'Cached Database Route'),
        ('MANUAL', 'Manually Entered Correction'),
    ]

    origin_name = models.CharField(max_length=255)
    origin_lat = models.DecimalField(max_digits=10, decimal_places=6)
    origin_lng = models.DecimalField(max_digits=10, decimal_places=6)

    dest_name = models.CharField(max_length=255)
    dest_lat = models.DecimalField(max_digits=10, decimal_places=6)
    dest_lng = models.DecimalField(max_digits=10, decimal_places=6)

    distance_km = models.DecimalField(max_digits=8, decimal_places=2)
    duration_min = models.DecimalField(max_digits=8, decimal_places=1, default=Decimal('0.0'))
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='LIVE')
    hit_count = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['origin_lat', 'origin_lng', 'dest_lat', 'dest_lng']),
        ]

    def __str__(self):
        return f"{self.origin_name} -> {self.dest_name} ({self.distance_km} km)"
