import os
import json
from datetime import datetime, timedelta
from google import genai as modern_genai
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Trip, Day, Place, Expense
from .serializers import TripSerializer, DaySerializer, PlaceSerializer, ExpenseSerializer
from .utils import get_weather_forecast
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from PIL import Image
import google.generativeai as legacy_genai
import json



class TripViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_itinerary(self, request, pk=None):
        trip = self.get_object()
        api_key = os.environ.get('GEMINI_API_KEY')
        
        if not api_key:
            return Response({"error": "Gemini API key is missing from .env!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Fetch Weather Data
            start = datetime.strptime(str(trip.start_date), '%Y-%m-%d')
            end = datetime.strptime(str(trip.end_date), '%Y-%m-%d')
            delta = end - start
            
            weather_dict = {} 
            weather_report = []
            
            for i in range(delta.days + 1):
                current_date = (start + timedelta(days=i)).strftime('%Y-%m-%d')
                condition = get_weather_forecast(trip.destination, current_date)
                if condition:
                    weather_dict[current_date] = condition
                    weather_report.append(f"{current_date}: {condition}")
            
            weather_context = "\n".join(weather_report) if weather_report else "Weather data unavailable."

            # --- NEW: 2. Calculate Financial Context ---
            total_budget = trip.budget
            total_spent = sum(exp.amount for exp in trip.expenses.all())
            remaining_budget = total_budget - total_spent

            # 3. Setup Gemini Client
            client = modern_genai.Client(api_key=api_key)

            # 4. Engineer the prompt
            prompt = f"""
            Act as an expert travel planner. Create a daily itinerary for a trip to {trip.destination} 
            from {trip.start_date} to {trip.end_date}.
            
            WEATHER FORECAST:
            {weather_context}
            
            FINANCIAL CONTEXT:
            Total Budget: Rs. {total_budget}
            Total Spent So Far: Rs. {total_spent}
            Remaining Budget: Rs. {remaining_budget}
            
            CRITICAL INSTRUCTIONS: 
            1. Weather: If heavy rain is expected, prioritize indoor alternatives.
            2. Budget: If the 'Remaining Budget' is low or negative, you MUST dynamically adjust the itinerary to suggest FREE or extremely cheap activities (like walking tours, free museums, or public parks). If they have plenty of budget left, suggest premium experiences.
            3. Alert: Write a brief 'budget_alert' message to the user analyzing their current spending pace and explaining the choices you made for this itinerary based on their wallet.
            
            Return ONLY a valid JSON object in exactly this format. Do not include markdown formatting or backticks:
            {{
                "budget_alert": "Your 1-2 sentence financial insight here.",
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
            
            # 5. Call AI
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            
            # 6. Parse structured JSON response
            clean_text = response.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
                
            data = json.loads(clean_text.strip())
            
            # --- NEW: 7. Save the Alert to the Trip ---
            trip.budget_alert = data.get("budget_alert", "")
            trip.save()
            
            # 8. Clear old itinerary and save the new AI data
            trip.days.all().delete()
            
            for day_data in data.get("days", []):
                day_date = day_data["date"]
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
            
            serializer = self.get_serializer(trip)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"💎 GEMINI CRASH DETAILS: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DayViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Day.objects.all()
    serializer_class = DaySerializer

class PlaceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_receipt(request):
    receipt_file = request.FILES.get('receipt')
    if not receipt_file:
        return Response({'error': 'No receipt image provided.'}, status=400)

    try:
        # Open the image using Pillow
        image = Image.open(receipt_file)
        
        # Use the Flash model for fast multimodal vision tasks
        model = legacy_genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        Analyze this receipt and extract the following details.
        Return ONLY a raw JSON object (no markdown, no backticks) with these exact keys:
        - "title": Short name of the merchant or item (e.g., "Starbucks", "Uber").
        - "amount": The total amount as a numeric string (e.g., "1500.00").
        - "category": Must be exactly one of: "Food", "Transport", "Accommodation", "Activities", "Other".
        """
        
        response = model.generate_content([prompt, image])
        
        # Clean up the response in case Gemini includes markdown formatting
        text_response = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text_response)
        
        return Response(data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)