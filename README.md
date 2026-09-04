# ✈️ TripWise: AI-Powered Travel Planner

TripWise is a full-stack web application that automatically generates detailed, multi-day travel itineraries using Google's Gemini AI. 

By simply inputting a destination and dates, the application leverages prompt engineering to generate a structured travel plan, stores the relational data in a PostgreSQL database, and dynamically plots the daily locations on an interactive map using exact GPS coordinates.

## ✨ Features
* **AI Itinerary Generation:** Integrates Google Gemini (3.6 Flash) to automatically research and plan realistic, multi-day vacations.
* **Interactive Mapping:** Plots AI-generated GPS coordinates directly onto an interactive Leaflet map.
* **Secure Authentication:** Implements JSON Web Tokens (JWT) for secure user login and session management.
* **Relational Database:** Handles complex nested data architectures (Trip → Day → Place) using PostgreSQL.

## 🛠️ Tech Stack
**Frontend**
* React (Vite)
* TypeScript
* Axios
* Leaflet Maps (react-leaflet)

**Backend**
* Django REST Framework (Python)
* PostgreSQL
* JWT (djangorestframework-simplejwt)
* Google GenAI SDK

## 🧠 Technical Highlights
* **Strict Prompt Engineering:** Engineered the Gemini AI prompt to bypass standard markdown responses and strictly output parseable JSON containing accurate latitudes and longitudes.
* **Data Flow Architecture:** Seamlessly routed complex nested JSON from a third-party AI, through a Django REST API, into a relational PostgreSQL database, and finally into a reactive frontend state.