from rest_framework import serializers
from .models import Trip, Day, Place

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = '__all__'

class DaySerializer(serializers.ModelSerializer):
    # This tells Django to fetch all places linked to this day
    places = PlaceSerializer(many=True, read_only=True)

    class Meta:
        model = Day
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    # This tells Django to fetch all days linked to this trip
    days = DaySerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'