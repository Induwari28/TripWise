from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Trip, Day, Place
from .serializers import TripSerializer, DaySerializer, PlaceSerializer

class TripViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# NEW: Handle Day requests
class DayViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Day.objects.all()
    serializer_class = DaySerializer

# NEW: Handle Place requests
class PlaceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer