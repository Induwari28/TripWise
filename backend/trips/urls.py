from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, DayViewSet, PlaceViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'days', DayViewSet)      # NEW
router.register(r'places', PlaceViewSet)  # NEW

urlpatterns = [
    path('', include(router.urls)),
]