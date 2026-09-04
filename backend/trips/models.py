from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    destination = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    number_of_people = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.destination} ({self.start_date} to {self.end_date})"

# NEW: Day Model
class Day(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='days')
    date = models.DateField()
    
    def __str__(self):
        return f"{self.trip.destination} - {self.date}"

# NEW: Place Model
class Place(models.Model):
    day = models.ForeignKey(Day, on_delete=models.CASCADE, related_name='places')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # NEW: Coordinates for the map integration
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name