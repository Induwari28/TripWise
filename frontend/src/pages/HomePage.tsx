import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Trip } from '../types';
import TripMap from '../components/TripMap';
import { MapPin, Calendar, DollarSign, Sparkles, Navigation, ArrowRight } from 'lucide-react';

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
        setDestination(''); setStartDate(''); setEndDate(''); setBudget('');
      })
      .catch(error => console.error(error));
  };

  // Isolate trips for the layout
  const featuredTrip = trips.length > 0 ? trips[trips.length - 1] : null; // Most recent trip
  const upcomingTrips = trips.length > 1 ? trips.slice(0, trips.length - 1).reverse() : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      
      {/* === LEFT COLUMN === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. Featured Trip Hero Card */}
        {featuredTrip ? (
          <div className="bento-card" style={{ 
            minHeight: '280px', 
            background: 'linear-gradient(135deg, var(--primary), #4f46e5)', 
            color: 'white', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative background elements */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            
            <div>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block', marginBottom: '16px' }}>
                Featured Plan
              </span>
              <h2 style={{ fontSize: '2.2rem', margin: '0 0 8px 0' }}>{featuredTrip.destination}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', opacity: 0.9 }}>
                <MapPin size={16} /> Listed site with majestic views
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>Budget Estimation</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem' }}>Rs. {parseFloat(featuredTrip.budget).toLocaleString()}</h3>
              </div>
              <Link to={`/trip/${featuredTrip.id}`} style={{ backgroundColor: '#a78bfa', color: '#1e293b', padding: '12px 24px', borderRadius: '30px', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' }}>
                See Details <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bento-card" style={{ minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <h2>Create a trip to see your featured plan!</h2>
          </div>
        )}

        {/* 2. Mini Map Bento Box */}
        <div className="bento-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Location Overview</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Expand Map</span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {/* Your exact Leaflet component, constrained beautifully inside the card */}
            <TripMap trips={trips} />
          </div>
        </div>

      </div>

      {/* === RIGHT COLUMN === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 3. AI Dream Destination Form */}
        <div className="bento-card">
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0', color: 'var(--text-dark)' }}>Find Your Dream</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>AI designs the best itinerary for you</p>
          
          <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <Navigation size={18} color="var(--primary)" style={{ marginRight: '10px' }} />
              <input type="text" placeholder="e.g. Beautiful beach in Bali" value={destination} onChange={(e) => setDestination(e.target.value)} required style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <Calendar size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.85rem', color: 'var(--text-dark)' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.85rem', color: 'var(--text-dark)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <DollarSign size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
              <input type="number" placeholder="Budget limit (Rs.)" value={budget} onChange={(e) => setBudget(e.target.value)} required style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem' }} />
            </div>

            <button type="submit" style={{ backgroundColor: '#bef264', color: '#166534', padding: '14px', borderRadius: 'var(--radius-sm)', border: 'none', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '1rem', cursor: 'pointer' }}>
              <Sparkles size={18} /> Generate Dream Trip
            </button>
          </form>
        </div>

        {/* 4. My Schedule (Upcoming Trips List) */}
        <div className="bento-card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>My Schedule</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>See All</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => (
                <div key={trip.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)' }}>{trip.destination}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> 
                      {trip.start_date} to {trip.end_date}
                    </p>
                  </div>
                  <Link to={`/trip/${trip.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', textDecoration: 'none' }}>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>No other upcoming trips.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}