from rest_framework import serializers
from .models import Trip, Day, Place, Expense # <--- NEW: Import Expense

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = '__all__'

class DaySerializer(serializers.ModelSerializer):
    # This tells Django to fetch all places linked to this day
    places = PlaceSerializer(many=True, read_only=True)

    class Meta:
        model = Day
        fields = ['id', 'date', 'weather_condition', 'places'] 

# --- NEW: Expense Serializer ---
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    days = DaySerializer(many=True, read_only=True)
    expenses = ExpenseSerializer(many=True, read_only=True) # <--- NEW: Link expenses to Trip
    
    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['user']