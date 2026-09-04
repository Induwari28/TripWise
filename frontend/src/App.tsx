import { useEffect, useState, FormEvent } from 'react'
import axios from 'axios'
import './App.css'
import TripMap from './components/TripMap'

interface Place {
  id: number
  name: string
  description: string
}

interface Day {
  id: number
  date: string
  weather_condition?: string // <--- ADDED THIS SO TYPESCRIPT KNOWS IT EXISTS
  places: Place[]
}

interface Trip {
  id: number
  destination: string
  start_date: string
  end_date: string
  budget: string
  number_of_people: number
  days: Day[] 
}

function App() {
  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Dashboard State
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  
  // AI Generation State
  const [generatingId, setGeneratingId] = useState<number | null>(null)

  // Fetch trips when the token changes
  useEffect(() => {
    if (token) {
      setLoading(true)
      axios.get('http://127.0.0.1:8000/api/trips/', {
        headers: { Authorization: `Bearer ${token}` } 
      })
        .then(response => {
          setTrips(response.data)
          setLoading(false)
        })
        .catch(error => {
          console.error(error)
          setLoading(false)
        })
    }
  }, [token])

  // Handle user login
  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    axios.post('http://127.0.0.1:8000/api/token/', { username, password })
      .then(response => {
        const accessToken = response.data.access
        localStorage.setItem('access_token', accessToken)
        setToken(accessToken)
      })
      .catch(error => {
        if (error.response) {
          alert(`Django Rejected It! Status: ${error.response.status}\nDetails: ${JSON.stringify(error.response.data)}`)
        } else {
          alert(`Network Error: Is the Django server running?`)
        }
      })
  }

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setTrips([]) 
  }

  // Handle new trip creation
  const handleCreateTrip = (e: FormEvent) => {
    e.preventDefault() 
    const newTrip = {
      destination: destination,
      start_date: startDate,
      end_date: endDate,
      budget: budget,
      number_of_people: 1
    }

    axios.post('http://127.0.0.1:8000/api/trips/', newTrip, {
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(response => {
        setTrips([...trips, response.data])
        setDestination(''); setStartDate(''); setEndDate(''); setBudget('')
      })
      .catch(error => console.error("Error creating trip:", error))
  }

  // Handle AI Itinerary Generation
  const handleGenerateItinerary = (tripId: number) => {
    setGeneratingId(tripId) // Triggers the loading spinner
    
    axios.post(`http://127.0.0.1:8000/api/trips/${tripId}/generate_itinerary/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        // Replace the old trip in our state with the new AI-generated one
        setTrips(trips.map(trip => trip.id === tripId ? response.data : trip))
        setGeneratingId(null) // Stop loading
      })
      .catch(error => {
        console.error("AI Error:", error)
        alert("Failed to generate itinerary. Check the Django terminal for errors!")
        setGeneratingId(null)
      })
  }

  // -------------------------------------------------------------
  // UI RENDERING
  // -------------------------------------------------------------

  // 1. If not logged in, show the Login Screen
  if (!token) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <h1>Log In to TripWise</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ padding: '10px' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px' }} />
          <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>Log In</button>
        </form>
      </div>
    )
  }

  // 2. If logged in, show the Dashboard
  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>TripWise Dashboard</h1>
        <button onClick={handleLogout} style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Log Out</button>
      </div>
      
      {loading && <div>Loading trips...</div>}
      
      <div className="create-trip-form" style={{ padding: '20px', backgroundColor: '#333', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>+ Create Trip</h2>
        <form onSubmit={handleCreateTrip} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          <input type="number" placeholder="Budget" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
        </form>
      </div>
      
        {/* Map Section */}
      <TripMap trips={trips} />

      <div className="trip-grid">
        {trips.map((trip) => (
          <div key={trip.id} className="trip-card" style={{ border: '1px solid #555', padding: '15px', margin: '10px 0', borderRadius: '8px', backgroundColor: '#222' }}>
            <h2>{trip.destination}</h2>
            <p>Dates: {trip.start_date} to {trip.end_date}</p>
            <p>Budget: Rs. {trip.budget}</p>
            <p>Travelers: {trip.number_of_people}</p>
            
            {/* NEW: AI Generation Button */}
            <button 
              onClick={() => handleGenerateItinerary(trip.id)}
              disabled={generatingId === trip.id}
              style={{
                backgroundColor: generatingId === trip.id ? '#555' : '#673ab7', 
                color: 'white',
                padding: '10px',
                border: 'none',
                borderRadius: '4px',
                cursor: generatingId === trip.id ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                width: '100%',
                fontWeight: 'bold'
              }}
            >
              {generatingId === trip.id ? '✨ Gemini is thinking...' : '✨ Generate AI Itinerary'}
            </button>
            
            {/* Itinerary Section */}
            {trip.days && trip.days.length > 0 && (
              <div className="itinerary" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#111', borderRadius: '6px' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '5px' }}>Itinerary</h3>
                
                {trip.days.map(day => (
                  <div key={day.id} style={{ marginBottom: '10px' }}>
                    
                    {/* ADDED CONDITIONAL WEATHER CHECK HERE */}
                    <h4 className="text-green-500 font-bold mb-2">
                       {day.date} {day.weather_condition && `— ☁️ ${day.weather_condition}`}
                    </h4>
                    
                    <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#ccc' }}>
                      {day.places && day.places.length > 0 ? (
                        day.places.map(place => (
                          <li key={place.id}>{place.name}</li>
                        ))
                      ) : (
                        <li style={{ color: '#777', listStyle: 'none' }}>No places added yet</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App