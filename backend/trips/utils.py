import os
import requests

def get_weather_forecast(destination, date):
    api_key = os.environ.get('WEATHER_API_KEY')
    
    # WeatherAPI endpoint for future forecasts
    url = f"http://api.weatherapi.com/v1/forecast.json?key={api_key}&q={destination}&dt={date}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Extract the condition (e.g., "Heavy rain", "Sunny")
        forecast_day = data['forecast']['forecastday'][0]
        condition = forecast_day['day']['condition']['text']
        
        return condition
    except Exception as e:
        print(f"Weather API Error: {e}")
        return None