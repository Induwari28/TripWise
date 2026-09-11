import os
import json
from datetime import datetime, timedelta
from google import genai as modern_genai
from google.genai import types as genai_types
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Trip, Day, Place, Expense
from .serializers import TripSerializer, DaySerializer, PlaceSerializer, ExpenseSerializer
from .utils import get_weather_forecast
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from PIL import Image
import json



class TripViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def recommend_next(self, request, pk=None):
        trip = self.get_object()
        api_key = os.environ.get('GEMINI_API_KEY')

        if not api_key:
            return Response({"error": "Gemini API key is missing from .env!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            total_budget = float(trip.budget or 0)
            total_spent = sum(float(exp.amount or 0) for exp in trip.expenses.all())
            remaining_budget = total_budget - total_spent
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            client = modern_genai.Client(api_key=api_key)
            prompt = (
                f"Act as a smart travel guide. The user is currently on a trip to {trip.destination}. "
                f"It is currently {current_time}. They have a remaining budget of Rs. {remaining_budget}. "
                "Suggest exactly ONE specific, highly contextual activity or food recommendation they should do right now. "
                "Keep it to 2-3 sentences and be engaging."
            )

            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )

            text_response = (response.text or '').strip()
            if text_response.startswith('```json'):
                text_response = text_response[len('```json'):].strip()
            if text_response.startswith('```'):
                text_response = text_response[3:].strip()
            if text_response.endswith('```'):
                text_response = text_response[:-3].strip()

            # The Gemini model may reply with a JSON object, a JSON object wrapped in
            # markdown fences, or plain prose. Handle all of those safely.
            cleaned = text_response.strip()
            if cleaned.startswith('{') and cleaned.endswith('}'):
                try:
                    payload = json.loads(cleaned)
                    recommendation = payload.get('recommendation') or payload.get('text') or cleaned
                    recommendation = str(recommendation).strip()
                except Exception:
                    recommendation = cleaned
            else:
                recommendation = cleaned

            if not recommendation:
                return Response({"error": "The recommendation service returned an empty reply."}, status=status.HTTP_502_BAD_GATEWAY)

            return Response({"recommendation": recommendation})

        except Exception as exc:
            print(f"💎 GEMINI RECOMMEND NEXT ERROR: {str(exc)}")
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                    weather_condition=weather_dict.get(day_date, '')
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

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        return Response({
            'username': request.user.username,
            'email': request.user.email,
        })

    email = str(request.data.get('email', '')).strip()
    if not email:
        return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_email(email)
    except ValidationError:
        return Response({'error': 'Enter a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.email = email
    request.user.save(update_fields=['email'])
    return Response({'username': request.user.username, 'email': request.user.email})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_receipt(request):
    receipt_file = request.FILES.get('receipt')
    if not receipt_file:
        return Response({'error': 'No receipt image provided.'}, status=400)

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return Response({'error': 'Gemini API key is missing from .env!'}, status=400)

    try:
        # Validate the upload and send it using the SDK's explicit image part format.
        image = Image.open(receipt_file)
        image.verify()
        receipt_file.seek(0)
        image_bytes = receipt_file.read()
    except Exception:
        return Response({'error': 'The uploaded file is not a valid image.'}, status=400)

    try:
        
        prompt = """
        Analyze this receipt and extract the following details.
        Return ONLY a raw JSON object (no markdown, no backticks) with these exact keys:
        - "title": Short name of the merchant or item (e.g., "Starbucks", "Uber").
        - "amount": The total amount as a numeric string (e.g., "1500.00").
        - "category": Must be exactly one of: "Food", "Transport", "Accommodation", "Activities", "Other".
        """
        
        client = modern_genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=[
                prompt,
                genai_types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=receipt_file.content_type or 'image/jpeg',
                ),
            ],
        )
        
        # Extract the JSON object even if the model adds markdown or commentary.
        text_response = (response.text or '').strip()
        start = text_response.find('{')
        end = text_response.rfind('}')
        if start == -1 or end <= start:
            return Response({'error': 'Gemini returned no valid JSON.'}, status=502)
        try:
            data = json.loads(text_response[start:end + 1])
        except json.JSONDecodeError:
            return Response({'error': 'Gemini returned malformed JSON.'}, status=502)
        
        return Response(data)
        
    except Exception as e:
        print(f"Receipt scan failed: {e}")
        return Response({'error': f'Receipt scanning failed: {e}'}, status=502)