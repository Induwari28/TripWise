import { useState, useEffect } from 'react';
import { Ticket, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { Trip } from '../types';

interface Props {
  token: string;
}

export default function MyTripsPage({ token }: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all trips from the Django backend
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/trips/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Reverse the array so your newest trips show up first!
        setTrips(response.data.reverse());
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className="my-trips-page" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header Card */}
      <div className="bento-card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, var(--primary), #4f46e5)', color: 'white', padding: '32px', borderRadius: '24px' }}>
        <h1 style={{ margin: '0', fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Ticket size={32} /> My Trips
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Review your past adventures and upcoming travel plans.</p>
      </div>

      {/* Dynamic Grid Layout */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Loading your trips...</p>
      ) : trips.length === 0 ? (
        <div className="bento-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', borderRadius: '24px' }}>
          <h2>No trips found!</h2>
          <p>Head back to the dashboard to generate your first AI itinerary.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '24px' 
        }}>
          {trips.map((trip) => (
            <div key={trip.id} className="bento-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              
              {/* Card Title */}
              <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: 'var(--text-dark)' }}>
                {trip.destination || 'Dream Destination'}
              </h2>
              
              {/* Card Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <span>{trip.start_date} to {trip.end_date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={18} color="var(--primary)" />
                  <span>Budget: Rs. {trip.budget?.toLocaleString()}</span>
                </div>
              </div>

              {/* Navigation Button */}
              <Link 
                to={`/trip/${trip.id}`} 
                style={{ 
                  marginTop: 'auto', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  backgroundColor: 'var(--primary-light)', 
                  color: 'var(--primary)', 
                  textDecoration: 'none', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  fontWeight: 600,
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                See Details <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}