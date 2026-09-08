from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import TripViewSet, DayViewSet, PlaceViewSet, ExpenseViewSet # <--- Import ExpenseViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'days', DayViewSet)
router.register(r'places', PlaceViewSet)
router.register(r'expenses', ExpenseViewSet) # <--- NEW ROUTE

urlpatterns = [
    path('', include(router.urls)),
    path('scan_receipt/', views.scan_receipt, name='scan_receipt'),
]