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
    path('trips/<int:pk>/recommend_next/', TripViewSet.as_view({'get': 'recommend_next'}), name='trip-recommend-next'),
    path('trips/<int:pk>/generate_itinerary/', TripViewSet.as_view({'post': 'generate_itinerary'}), name='trip-generate-itinerary'),
    path('profile/', views.profile, name='profile'),
    path('scan_receipt/', views.scan_receipt, name='scan_receipt'),
]