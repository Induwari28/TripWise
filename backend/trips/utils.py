import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_weather_forecast(destination, date):
    api_key = os.environ.get('WEATHER_API_KEY')
    if not api_key:
        print('Weather API key is missing from environment.')
        return None

    date_text = str(date)
    urls = [
        f"http://api.weatherapi.com/v1/forecast.json?key={api_key}&q={destination}&dt={date_text}",
        f"http://api.weatherapi.com/v1/history.json?key={api_key}&q={destination}&dt={date_text}",
    ]

    errors = []
    for url in urls:
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()

            forecast_days = data.get('forecast', {}).get('forecastday', [])
            if not forecast_days:
                # WeatherAPI history route also nests results under `forecast.forecastday`.
                forecast_days = data.get('forecastday', [])

            if not forecast_days:
                errors.append('Weather API returned no forecastday entries.')
                continue

            forecast_day = forecast_days[0]
            condition = forecast_day.get('day', {}).get('condition', {}).get('text')
            if condition:
                return str(condition)

            condition = forecast_day.get('condition', {}).get('text')
            if condition:
                return str(condition)

            errors.append('Weather API did not return a condition text field.')
        except Exception as exc:
            errors.append(f"Weather API Error: {exc}")

    for error in errors:
        print(error)
    return None