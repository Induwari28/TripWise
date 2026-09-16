# TripWise: Intelligent AI Travel Companion

TripWise is a deployed full-stack web application that dynamically generates, maps, and manages detailed travel itineraries using Google's Gemini AI. 

Unlike static travel planners, TripWise evaluates real-time weather forecasts, current local time, and active budget constraints to continuously optimize the user's travel experience.

## 🚀 Live Demo
**[https://trip-wise-gules.vercel.app/]**

## 💡 Core Features
* **AI Itinerary Generation:** Integrates Google Gemini (3.6 Flash) to automatically research and plan realistic, multi-day vacations mapped to a relational database.
* **Dynamic Weather Replanning:** Uses WeatherAPI to detect rain and dynamically pushes outdoor activities to sunny days while prioritizing museums and cafes during storms.
* **Real-Time Budget Tracking:** Tracks logged expenses against the trip limit. Triggers an AI-generated "Budget Insight" to suggest cheaper alternatives if the user is pacing to overspend.
* **Context-Aware Live Recommendations:** The "What should I do now?" engine evaluates the user's remaining budget, destination, and current local time to query Gemini for an immediate, highly specific activity.
* **Interactive Mapping:** Plots AI-generated GPS coordinates directly onto an interactive Leaflet map.

## 🛠️ Tech Stack
* **Frontend:** React (Vite), TypeScript, Tailwind CSS, Axios, Leaflet Maps
* **Backend:** Django REST Framework, Python
* **Database:** PostgreSQL
* **Authentication:** JSON Web Tokens (djangorestframework-simplejwt)
* **External APIs:** Google GenAI SDK, WeatherAPI

## 🧠 Technical Highlights
* **Strict Prompt Engineering:** Engineered the Gemini AI prompt to bypass standard markdown responses and strictly output parseable JSON containing accurate latitudes and longitudes.
* **Data Flow Architecture:** Seamlessly routed complex nested JSON from a third-party AI, through a Django REST API, into a relational PostgreSQL database, and finally into a reactive frontend state.
