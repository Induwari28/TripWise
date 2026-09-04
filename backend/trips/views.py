import os
import json
from google import genai # <--- UPDATED IMPORT
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Trip, Day, Place
from .serializers import TripSerializer, DaySerializer, PlaceSerializer

class TripViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # --- NEW AI FEATURE BELOW ---
    @action(detail=True, methods=['post'])
    def generate_itinerary(self, request, pk=None):
        trip = self.get_object()
        api_key = os.environ.get('GEMINI_API_KEY')
        
        if not api_key:
            return Response({"error": "Gemini API key is missing from .env!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Setup the NEW Gemini Client
            client = genai.Client(api_key=api_key)

            # 2. Engineer the prompt to demand strictly formatted JSON
            prompt = f"""
            Act as an expert travel planner. Create a daily itinerary for a trip to {trip.destination} 
            from {trip.start_date} to {trip.end_date}.
            Return ONLY a valid JSON object in exactly this format. Do not include markdown formatting or backticks:
            {{
                "days": [
                    {{
                        "date": "YYYY-MM-DD",
                        "places": [
                            {{
                                "name": "Exact Name of Place",
                                "description": "A 1-sentence description",
                                "latitude": 6.8767,
                                "longitude": 81.0606
                            }}
                        ]
                    }}
                ]
            }}
            """
            
            # 3. Call the AI using the modern 2026 syntax
            response = client.models.generate_content(
        
                model='gemini-3.6-flash', # <--- CHANGED THIS TO 3.6
                contents=prompt
            )
            
            # 4. Clean the response (Strip markdown code blocks if Gemini includes them)
            clean_text = response.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
                
            data = json.loads(clean_text.strip())
            
            # 5. Clear old itinerary and save the new AI data to PostgreSQL
            trip.days.all().delete()
            
            for day_data in data.get("days", []):
                day = Day.objects.create(trip=trip, date=day_data["date"])
                for place_data in day_data.get("places", []):
                    Place.objects.create(
                        day=day,
                        name=place_data["name"],
                        description=place_data["description"],
                        latitude=place_data.get("latitude"),
                        longitude=place_data.get("longitude")
                    )
            

            # 6. Return the fully updated trip back to React
            serializer = self.get_serializer(trip)
            return Response(serializer.data)
        
        except Exception as e:
         print(f"💎 GEMINI CRASH DETAILS: {str(e)}") # <--- ADD THIS LINE
         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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