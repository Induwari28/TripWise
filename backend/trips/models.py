from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    destination = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    budget_alert = models.TextField(null=True, blank=True) # <--- NEW FIELD

    def __str__(self):
        return f"{self.destination} ({self.start_date})"

class Day(models.Model):
    trip = models.ForeignKey(Trip, related_name='days', on_delete=models.CASCADE)
    date = models.DateField()
    weather_condition = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.trip.destination} - {self.date}"

class Place(models.Model):
    day = models.ForeignKey(Day, related_name='places', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('Transport', 'Transport'),
        ('Accommodation', 'Accommodation'),
        ('Food', 'Food'),
        ('Activities', 'Activities'),
        ('Other', 'Other'),
    ]

    # Link this expense directly to a specific Trip
    trip = models.ForeignKey(Trip, related_name='expenses', on_delete=models.CASCADE)
    
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - Rs. {self.amount}"