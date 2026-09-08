import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Trip } from '../types';
import TripMap from '../components/TripMap';

interface Props {
  trips: Trip[];
  setTrips: (trips: Trip[]) => void;
  token: string;
}

export default function HomePage({ trips, setTrips, token }: Props) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const handleCreateTrip = (e: FormEvent) => {
    e.preventDefault();
    const newTrip = { destination, start_date: startDate, end_date: endDate, budget, number_of_people: 1 };

    axios.post('http://127.0.0.1:8000/api/trips/', newTrip, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setTrips([...trips, response.data]);
        setDestination(''); 
        setStartDate(''); 
        setEndDate(''); 
        setBudget('');
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      {/* Create Trip Form */}
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
      
      {/* Leaflet Map */}
      <TripMap trips={trips} />

      {/* Simple Trip Summary Cards */}
      <div className="trip-grid" style={{ marginTop: '20px' }}>
        {trips.map((trip) => {
          const totalBudget = parseFloat(trip.budget);
          
          return (
            <div key={trip.id} className="trip-card" style={{ border: '1px solid #555', padding: '20px', margin: '15px 0', borderRadius: '8px', backgroundColor: '#222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 10px 0' }}>{trip.destination}</h2>
                <p style={{ margin: 0, color: '#aaa' }}>Dates: {trip.start_date} to {trip.end_date}</p>
                <p style={{ margin: '5px 0 0 0', color: '#ddd' }}>Budget Limit: Rs. {totalBudget.toFixed(2)}</p>
              </div>
              
              {/* Link to the dedicated Trip Details Page */}
              <Link to={`/trip/${trip.id}`} style={{ backgroundColor: '#673ab7', color: 'white', padding: '12px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                Manage Trip ➔
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}