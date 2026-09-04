import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Tell the map what data it will receive
interface TripMapProps {
  trips: any[] // We pass the full trips array in
}

export default function TripMap({ trips }: TripMapProps) {
  const position: [number, number] = [7.8731, 80.7718] 

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginTop: '20px', border: '1px solid #555' }}>
      <MapContainer center={position} zoom={7} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Loop through trips -> days -> places to draw markers */}
        {trips.map(trip => 
          trip.days?.map((day: any) => 
            day.places?.map((place: any) => {
              // Only draw a marker if the place has coordinates!
              if (place.latitude && place.longitude) {
                return (
                  <Marker key={place.id} position={[place.latitude, place.longitude]}>
                    <Popup>
                      <strong style={{color: 'black'}}>{place.name}</strong> <br /> 
                      <span style={{color: 'black'}}>{trip.destination} - {day.date}</span>
                    </Popup>
                  </Marker>
                )
              }
              return null
            })
          )
        )}
        
      </MapContainer>
    </div>
  )
}