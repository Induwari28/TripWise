import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import type { Trip } from '../types';

interface Props {
  trips: Trip[];
  setTrips: (trips: Trip[]) => void;
  token: string;
}

export default function TripDetailsPage({ trips, setTrips, token }: Props) {
  const { id } = useParams<{ id: string }>();
  const [generating, setGenerating] = useState(false);

  // Find the specific trip from the URL ID
  const trip = trips.find(t => t.id === parseInt(id || '0'));

  if (!trip) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
        <h2>Trip not found!</h2>
        <Link to="/" style={{ color: '#4CAF50' }}>Return to Dashboard</Link>
      </div>
    );
  }

  const totalBudget = parseFloat(trip.budget);
  const totalSpent = (trip.expenses || []).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentPercentage = Math.min((totalSpent / totalBudget) * 100, 100);

  const handleAddExpense = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const newExpense = {
      trip: trip.id,
      title: formData.get('title'),
      amount: formData.get('amount'),
      category: formData.get('category')
    };

    axios.post('http://127.0.0.1:8000/api/expenses/', newExpense, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setTrips(trips.map(t => {
          if (t.id === trip.id) {
            const currentExpenses = t.expenses || [];
            return { ...t, expenses: [...currentExpenses, response.data] };
          }
          return t;
        }));
        form.reset();
      })
      .catch(error => console.error("Error adding expense:", error));
  };

  const handleGenerateItinerary = () => {
    setGenerating(true);
    axios.post(`http://127.0.0.1:8000/api/trips/${trip.id}/generate_itinerary/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setTrips(trips.map(t => t.id === trip.id ? response.data : t));
        setGenerating(false);
      })
      .catch(() => {
        alert("Failed to generate itinerary.");
        setGenerating(false);
      });
  };

  return (
    <div className="trip-details-container" style={{ maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      
      <Link to="/" style={{ color: '#aaa', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        ← Back to Dashboard
      </Link>

      <div style={{ border: '1px solid #555', padding: '20px', borderRadius: '8px', backgroundColor: '#222', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>{trip.destination}</h2>
        <p style={{ margin: 0, color: '#aaa' }}>Dates: {trip.start_date} to {trip.end_date}</p>
        
        {/* Budget Tracker UI */}
        <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '8px', marginTop: '20px', border: '1px solid #444', textAlign: 'left' }}>
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
              borderRadius: '5px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>

          {/* Add Expense Form */}
          <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input type="text" name="title" placeholder="What did you buy?" required style={{ flex: 1, padding: '8px' }} />
            <input type="number" name="amount" placeholder="Amount" step="0.01" required style={{ width: '100px', padding: '8px' }} />
            <select name="category" required style={{ width: '130px', padding: '8px' }}>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Activities">Activities</option>
              <option value="Other">Other</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer' }}>Add</button>
          </form>

          {/* Expense List */}
          {trip.expenses && trip.expenses.length > 0 && (
            <ul style={{ padding: 0, listStyle: 'none', margin: 0, fontSize: '0.9em' }}>
              {trip.expenses.map(exp => (
                <li key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '8px 0' }}>
                  <span>{exp.title} <span style={{ color: '#888', fontSize: '0.8em' }}>({exp.category})</span></span>
                  <span>Rs. {parseFloat(exp.amount).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button 
          onClick={handleGenerateItinerary}
          disabled={generating}
          style={{ backgroundColor: generating ? '#555' : '#673ab7', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: generating ? 'not-allowed' : 'pointer', marginTop: '20px', width: '100%', fontWeight: 'bold', fontSize: '1.1em' }}
        >
          {generating ? '✨ Gemini is thinking...' : '✨ Generate AI Itinerary'}
        </button>
        
        {/* Itinerary Section */}
        {trip.days && trip.days.length > 0 && (
          <div className="itinerary" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#111', borderRadius: '6px', textAlign: 'left' }}>
            
            {/* AI Budget Alert Banner */}
            {trip.budget_alert && (
              <div style={{ padding: '12px 16px', backgroundColor: '#3f51b533', borderLeft: '4px solid #7c4dff', marginBottom: '15px', borderRadius: '4px' }}>
                <strong style={{ color: '#b388ff' }}>🤖 AI Budget Insight:</strong> {trip.budget_alert}
              </div>
            )}

            <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px', textAlign: 'center' }}>Itinerary</h3>
            {trip.days.map(day => (
              <div key={day.id} style={{ marginBottom: '15px' }}>
                <h4 className="text-green-500 font-bold mb-2" style={{ color: '#aaa', textAlign: 'center' }}>
                  {day.date} {day.weather_condition && `— ☁️ ${day.weather_condition}`}
                </h4>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#ccc' }}>
                  {day.places && day.places.length > 0 ? (
                    day.places.map(place => <li key={place.id} style={{ marginBottom: '5px' }}>{place.name}</li>)
                  ) : (
                    <li style={{ color: '#777', listStyle: 'none', textAlign: 'center' }}>No places added yet</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}