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
    paid_by = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    split_among = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Expense
        fields = ['id', 'trip', 'title', 'amount', 'category', 'date_added', 'paid_by', 'split_among']
        read_only_fields = ['id', 'date_added']

    def validate_paid_by(self, value):
        return value or 'Induwari'

    def validate_split_among(self, value):
        return value or []

    def create(self, validated_data):
        validated_data['paid_by'] = validated_data.get('paid_by') or 'Induwari'
        validated_data['split_among'] = validated_data.get('split_among') or []
        return Expense.objects.create(**validated_data)

class TripSerializer(serializers.ModelSerializer):
    days = DaySerializer(many=True, read_only=True)
    expenses = ExpenseSerializer(many=True, read_only=True) # <--- NEW: Link expenses to Trip
    
    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['user']