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
  weather_condition?: string
  places: Place[]
}

interface Expense {
  id: number
  title: string
  amount: string
  category: string
}

interface Trip {
  id: number
  destination: string
  start_date: string
  end_date: string
  budget: string
  number_of_people: number
  days: Day[]
  expenses?: Expense[]
  budget_alert?: string // <--- Added: AI Budget Alert
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  
  // Trip Form State
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  
  const [generatingId, setGeneratingId] = useState<number | null>(null)

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

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    axios.post('http://127.0.0.1:8000/api/token/', { username, password })
      .then(response => {
        const accessToken = response.data.access
        localStorage.setItem('access_token', accessToken)
        setToken(accessToken)
      })
      .catch(error => alert("Login Failed!"))
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setTrips([]) 
  }

  const handleCreateTrip = (e: FormEvent) => {
    e.preventDefault() 
    const newTrip = { destination, start_date: startDate, end_date: endDate, budget, number_of_people: 1 }

    axios.post('http://127.0.0.1:8000/api/trips/', newTrip, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setTrips([...trips, response.data])
        setDestination(''); setStartDate(''); setEndDate(''); setBudget('')
      })
      .catch(error => console.error(error))
  }

  const handleGenerateItinerary = (tripId: number) => {
    setGeneratingId(tripId)
    axios.post(`http://127.0.0.1:8000/api/trips/${tripId}/generate_itinerary/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setTrips(trips.map(trip => trip.id === tripId ? response.data : trip))
        setGeneratingId(null)
      })
      .catch(error => {
        alert("Failed to generate itinerary.")
        setGeneratingId(null)
      })
  }

  const handleAddExpense = (e: FormEvent<HTMLFormElement>, tripId: number) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const newExpense = {
      trip: tripId,
      title: formData.get('title'),
      amount: formData.get('amount'),
      category: formData.get('category')
    }

    axios.post('http://127.0.0.1:8000/api/expenses/', newExpense, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setTrips(trips.map(trip => {
          if (trip.id === tripId) {
            const currentExpenses = trip.expenses || []
            return { ...trip, expenses: [...currentExpenses, response.data] }
          }
          return trip
        }))
        form.reset()
      })
      .catch(error => console.error("Error adding expense:", error))
  }

  // ---------------- UI RENDERING ----------------

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
          <input type="number" placeholder="Budget limit (Rs.)" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
        </form>
      </div>
      
      <TripMap trips={trips} />

      <div className="trip-grid">
        {trips.map((trip) => {
          const totalBudget = parseFloat(trip.budget)
          const totalSpent = (trip.expenses || []).reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
          const remainingBudget = totalBudget - totalSpent
          const spentPercentage = Math.min((totalSpent / totalBudget) * 100, 100)

          return (
            <div key={trip.id} className="trip-card" style={{ border: '1px solid #555', padding: '20px', margin: '15px 0', borderRadius: '8px', backgroundColor: '#222' }}>
              <h2>{trip.destination}</h2>
              <p>Dates: {trip.start_date} to {trip.end_date}</p>
              
              {/* Budget Tracker UI */}
              <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #444' }}>
                <h3 style={{ marginTop: 0 }}>Budget Tracker</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span><strong>Limit:</strong> Rs. {totalBudget.toFixed(2)}</span>
                  <span style={{ color: remainingBudget < 0 ? '#f44336' : '#4CAF50' }}>
                    <strong>Remaining:</strong> Rs. {remainingBudget.toFixed(2)}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div style={{ width: '100%', backgroundColor: '#444', height: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                  <div style={{ 
                    width: `${spentPercentage}%`, 
                    backgroundColor: spentPercentage > 90 ? '#f44336' : '#4CAF50', 
                    height: '100%', 
                    borderRadius: '5px' 
                  }}></div>
                </div>

                {/* Add Expense Form */}
                <form onSubmit={(e) => handleAddExpense(e, trip.id)} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input type="text" name="title" placeholder="What did you buy?" required style={{ flex: 1 }} />
                  <input type="number" name="amount" placeholder="Amount" step="0.01" required style={{ width: '100px' }} />
                  <select name="category" required style={{ width: '130px' }}>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Activities">Activities</option>
                    <option value="Other">Other</option>
                  </select>
                  <button type="submit" style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 15px', cursor: 'pointer' }}>Add</button>
                </form>

                {/* Expense List */}
                {trip.expenses && trip.expenses.length > 0 && (
                  <ul style={{ padding: 0, listStyle: 'none', margin: 0, fontSize: '0.9em' }}>
                    {trip.expenses.map(exp => (
                      <li key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '5px 0' }}>
                        <span>{exp.title} <span style={{ color: '#888', fontSize: '0.8em' }}>({exp.category})</span></span>
                        <span>Rs. {parseFloat(exp.amount).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button 
                onClick={() => handleGenerateItinerary(trip.id)}
                disabled={generatingId === trip.id}
                style={{ backgroundColor: generatingId === trip.id ? '#555' : '#673ab7', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: generatingId === trip.id ? 'not-allowed' : 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold' }}
              >
                {generatingId === trip.id ? '✨ Gemini is thinking...' : '✨ Generate AI Itinerary'}
              </button>
              
              {/* Itinerary Section */}
              {trip.days && trip.days.length > 0 && (
                <div className="itinerary" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#111', borderRadius: '6px' }}>
                  
                  {/* AI Budget Alert Banner */}
                  {trip.budget_alert && (
                    <div style={{ padding: '12px 16px', backgroundColor: '#3f51b533', borderLeft: '4px solid #7c4dff', marginBottom: '15px', borderRadius: '4px' }}>
                      <strong style={{ color: '#b388ff' }}>🤖 AI Budget Insight:</strong> {trip.budget_alert}
                    </div>
                  )}

                  <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '5px' }}>Itinerary</h3>
                  {trip.days.map(day => (
                    <div key={day.id} style={{ marginBottom: '10px' }}>
                      <h4 className="text-green-500 font-bold mb-2">
                        {day.date} {day.weather_condition && `— ☁️ ${day.weather_condition}`}
                      </h4>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#ccc' }}>
                        {day.places && day.places.length > 0 ? (
                          day.places.map(place => <li key={place.id}>{place.name}</li>)
                        ) : (
                          <li style={{ color: '#777', listStyle: 'none' }}>No places added yet</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App