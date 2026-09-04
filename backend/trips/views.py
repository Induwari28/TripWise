import os
import json
from datetime import datetime, timedelta
from google import genai
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Trip, Day, Place
from .serializers import TripSerializer, DaySerializer, PlaceSerializer
from .utils import get_weather_forecast

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
            # 1. Fetch the Weather Report for all trip dates
            start = datetime.strptime(str(trip.start_date), '%Y-%m-%d')
            end = datetime.strptime(str(trip.end_date), '%Y-%m-%d')
            delta = end - start
            
            # --- THE FIX IS HERE ---
            weather_dict = {} 
            weather_report = []
            
            for i in range(delta.days + 1):
                current_date = (start + timedelta(days=i)).strftime('%Y-%m-%d')
                condition = get_weather_forecast(trip.destination, current_date)
                if condition:
                    weather_dict[current_date] = condition # Save it so we can put it in the database later
                    weather_report.append(f"{current_date}: {condition}")
            
            weather_context = "\n".join(weather_report) if weather_report else "Weather data unavailable."

            # 2. Setup the Gemini Client
            client = genai.Client(api_key=api_key)

            # 3. Engineer the prompt WITH Weather Intelligence
            prompt = f"""
            Act as an expert travel planner. Create a daily itinerary for a trip to {trip.destination} 
            from {trip.start_date} to {trip.end_date}.
            
            WEATHER FORECAST:
            {weather_context}
            
            CRITICAL INSTRUCTION: You must analyze the weather forecast above. If heavy rain or bad weather is expected on a specific day, you MUST dynamically adjust the itinerary to prioritize indoor alternatives (like museums, cafes, or indoor attractions) for that day, and move outdoor hikes/activities to the sunny days.
            
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
            
            # 4. Call the AI
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            
            # 5. Clean the response 
            clean_text = response.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
                
            data = json.loads(clean_text.strip())
            
            # 6. Clear old itinerary and save the new AI data
            trip.days.all().delete()
            
            for day_data in data.get("days", []):
                day_date = day_data["date"]
                
                # --- THE FIX IS HERE ---
                # We now explicitly tell Django to save the weather_condition to PostgreSQL
                day = Day.objects.create(
                    trip=trip, 
                    date=day_date,
                    weather_condition=weather_dict.get(day_date, "Unknown")
                )
                
                for place_data in day_data.get("places", []):
                    Place.objects.create(
                        day=day,
                        name=place_data["name"],
                        description=place_data["description"],
                        latitude=place_data.get("latitude"),
                        longitude=place_data.get("longitude")
                    )
            
            # 7. Return the fully updated trip back to React
            serializer = self.get_serializer(trip)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"💎 GEMINI CRASH DETAILS: {str(e)}")
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