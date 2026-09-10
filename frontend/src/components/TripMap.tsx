import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Trip, Place } from '../types';

// Fix for missing marker icons in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- NEW: Helper component to make the map fly to the searched location ---
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 10, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

// --- AI Routing Component ---
function TripRoute({ places, color }: { places: Place[], color: string }) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    // Filter out places missing coordinates, and ensure we have at least 2 points to draw a line
    const validPlaces = places.filter(p => p.latitude && p.longitude);
    if (validPlaces.length < 2) return;

    // OSRM API expects format: lon,lat;lon,lat;...
    const coordsString = validPlaces
      .map(p => `${p.longitude},${p.latitude}`)
      .join(';');

    // Fetch the optimal driving route
    axios.get(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`)
      .then(res => {
        const coords = res.data.routes[0].geometry.coordinates;
        // OSRM returns GeoJSON [longitude, latitude], but Leaflet draws using [latitude, longitude]
        const latLngs = coords.map((c: [number, number]) => [c[1], c[0]]);
        setRouteCoords(latLngs);
      })
      .catch(err => console.error("Routing error:", err));
  }, [places]);

  if (routeCoords.length === 0) return null;
  
  return <Polyline positions={routeCoords} color={color} weight={5} opacity={0.8} />;
}

interface Props {
  trips: Trip[];
}

export default function TripMap({ trips }: Props) {
  // Vibrant colors to differentiate multiple trips on the same map
  const colors = ['#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  // Extract all valid places for the markers
  const allPlaces = useMemo(() => {
    const places: Place[] = [];
    trips.forEach(trip => {
      trip.days?.forEach(day => {
        day.places?.forEach(place => {
          if (place.latitude && place.longitude) {
            places.push(place);
          }
        });
      });
    });
    return places;
  }, [trips]);

  // Center map on the first available place, or default to Sri Lanka
  const center: [number, number] = allPlaces.length > 0 
    ? [Number(allPlaces[0].latitude), Number(allPlaces[0].longitude)]
    : [7.8731, 80.7718]; 

  return (
    <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%', borderRadius: '16px', zIndex: 1 }}>
      
      {/* This one line makes the map zoom and pan dynamically! */}
      <MapUpdater center={center} />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      
      {/* 1. Draw the Road Routes */}
      {trips.map((trip, index) => {
        // Flatten all places for this specific trip in chronological order
        const tripPlaces: Place[] = [];
        trip.days?.forEach(day => day.places?.forEach(p => tripPlaces.push(p)));
        
        return <TripRoute key={trip.id} places={tripPlaces} color={colors[index % colors.length]} />;
      })}

      {/* 2. Draw the Map Markers */}
      {allPlaces.map((place) => (
        <Marker key={place.id} position={[Number(place.latitude), Number(place.longitude)]}>
          <Popup>
            <strong>{place.name}</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>{place.description}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}