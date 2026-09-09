# ✈️ TripWise: AI-Powered Travel Planner & Financial Dashboard

TripWise is a full-stack web application that combines automated travel planning with intelligent budget tracking. 

Built with a modern "Bento Box" design system, the application leverages Google's Gemini AI to generate structured, multi-day itineraries and utilizes Gemini Vision to automatically extract data from uploaded receipt images. Daily destinations and real-world driving routes are dynamically plotted on an interactive map.

## ✨ Features
* **AI Itinerary Generation:** Integrates Google Gemini 1.5 Flash to automatically research and plan realistic, multi-day vacations based on budget constraints.
* **Multimodal Receipt Scanner:** Upload receipt photos to automatically extract the merchant name, total amount, and category directly into your expense ledger.
* **Interactive Map Routing:** Plots AI-generated GPS coordinates onto a Leaflet map and draws real-world driving paths between daily destinations using the OSRM API.
* **Bento Box UI:** A responsive, modern dashboard architecture featuring CSS Grid-based widget cards and clean, accessible typography.
* **Secure Authentication:** Implements JSON Web Tokens (JWT) for secure user login and session management.

## 🛠️ Tech Stack
**Frontend**
* React (Vite)
* TypeScript
* React Router (Multi-Page Architecture)
* Leaflet Maps & OSRM API

**Backend**
* Django & Django REST Framework (Python)
* PostgreSQL
* Python Pillow (Image Processing)
* JWT (djangorestframework-simplejwt)
* Google GenAI SDK

## 🧠 Technical Highlights
* **Multimodal Data Extraction:** Engineered a pipeline that securely handles image uploads, passes them to Gemini Vision for analysis, and strictly outputs parseable JSON to auto-fill frontend React state variables.
* **Strict Prompt Engineering:** Engineered the Gemini AI text prompt to bypass standard markdown responses and strictly output parseable JSON containing accurate, localized latitudes and longitudes.
* **Geospatial Data Flow:** Seamlessly routes complex nested JSON from a third-party AI, through a Django REST API, into a relational PostgreSQL database (Trip → Day → Place), and finally renders dynamic coordinates and route geometry on the frontend.