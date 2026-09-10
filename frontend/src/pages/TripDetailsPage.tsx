import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import type { Trip } from '../types';
import { ArrowLeft, Wallet, Receipt, Sparkles, MapPin, Calendar, Plus, BrainCircuit, Camera, Heart } from 'lucide-react';

interface Props {
  trips: Trip[];
  setTrips: (trips: Trip[]) => void;
  token: string;
}

export default function TripDetailsPage({ trips, setTrips, token }: Props) {
  const { id } = useParams<{ id: string }>();
  const [generating, setGenerating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Controlled states for the Expense Form so AI can auto-fill them
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');

  const trip = trips.find(t => t.id === parseInt(id || '0'));

  if (!trip) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Trip not found</h2>
        <Link to="/">Return to Dashboard</Link>
      </div>
    );
  }

  const handleAddToFavorites = () => {
    const saved = localStorage.getItem('tripwise_favorites');
    const currentFavorites = saved ? JSON.parse(saved) : [];
    const newFavorite = {
      id: trip.id,
      name: trip.destination,
      location: `${trip.start_date} to ${trip.end_date}`,
      rating: 5.0,
      tags: ['Saved Itinerary'],
    };

    const isDuplicate = currentFavorites.some((favorite: { name: string }) => favorite.name === trip.destination);
    if (!isDuplicate) {
      localStorage.setItem('tripwise_favorites', JSON.stringify([...currentFavorites, newFavorite]));
      alert(`${trip.destination} has been added to your Favorites!`);
    } else {
      alert(`${trip.destination} is already in your Favorites.`);
    }
  };

  const totalBudget = parseFloat(trip.budget);
  const totalSpent = (trip.expenses || []).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentPercentage = Math.min((totalSpent / totalBudget) * 100, 100);

  // --- AI Receipt Scanner Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const formData = new FormData();
    formData.append('receipt', file);

    axios.post('https://tripwise-cknt.onrender.com/api/scan_receipt/', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      // Auto-fill the form fields with Gemini's vision extraction
      setExpenseTitle(response.data.title || '');
      setExpenseAmount(response.data.amount || '');
      
      const validCategories = ["Food", "Transport", "Accommodation", "Activities", "Other"];
      if (validCategories.includes(response.data.category)) {
        setExpenseCategory(response.data.category);
      }
      setScanning(false);
    })
    .catch(error => {
      console.error("Error scanning receipt:", error);
      const message = axios.isAxiosError(error) && typeof error.response?.data?.error === 'string'
        ? error.response.data.error
        : "Failed to scan receipt. Ensure the image is clear.";
      alert(message);
      setScanning(false);
    });
  };

  // --- Manual/Auto-filled Submission ---
  const handleAddExpense = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newExpense = {
      trip: trip.id,
      title: expenseTitle,
      amount: expenseAmount,
      category: expenseCategory
    };

    axios.post('https://tripwise-cknt.onrender.com/api/expenses/', newExpense, {
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
        // Clear the form after saving
        setExpenseTitle('');
        setExpenseAmount('');
        setExpenseCategory('Food');
      })
      .catch(error => console.error("Error adding expense:", error));
  };

  const handleGenerateItinerary = () => {
    setGenerating(true);
    axios.post(`https://tripwise-cknt.onrender.com/api/trips/${trip.id}/generate_itinerary/`, {}, {
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px', fontWeight: 600, transition: 'color 0.2s' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="bento-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--primary), #4f46e5)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2.4rem' }}>{trip.destination}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={18}/> {trip.start_date} to {trip.end_date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18}/> {trip.number_of_people} Traveler(s)</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToFavorites}
          title="Add to favorites"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', borderRadius: '10px', backgroundColor: 'white', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
        >
          <Heart size={18} /> Favorite
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        
        {/* === LEFT COLUMN: BUDGET & EXPENSES === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="bento-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Wallet size={24} color="var(--primary)" />
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-dark)' }}>Budget Tracker</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Limit: <strong>Rs. {totalBudget.toLocaleString()}</strong></span>
              <span style={{ color: remainingBudget < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                Remaining: Rs. {remainingBudget.toLocaleString()}
              </span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${spentPercentage}%`, backgroundColor: spentPercentage > 90 ? 'var(--danger)' : 'var(--primary)', height: '100%', borderRadius: '6px', transition: 'width 0.4s ease' }}></div>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>{spentPercentage.toFixed(1)}% Spent</p>
          </div>

          <div className="bento-card" style={{ flex: 1 }}>
            
            {/* Updated Header with Scan Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Receipt size={24} color="var(--primary)" /> Expense Ledger
              </h3>
              
              {/* Hidden File Input */}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: scanning ? 'not-allowed' : 'pointer' }}
              >
                {scanning ? <BrainCircuit size={16} className="animate-pulse" /> : <Camera size={16} />} 
                {scanning ? 'Scanning...' : 'Scan Receipt'}
              </button>
            </div>

            {/* Controlled Expense Form */}
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <input type="text" placeholder="What did you buy?" required value={expenseTitle} onChange={e => setExpenseTitle(e.target.value)} style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="number" placeholder="Amount (Rs.)" step="0.01" required value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', flex: 1 }} />
                <select required value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', flex: 1, backgroundColor: 'white' }}>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Activities">Activities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" style={{ backgroundColor: 'var(--text-dark)', color: 'white', border: 'none', borderRadius: '6px', padding: '10px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Save Expense
              </button>
            </form>

            {/* Expense List */}
            {trip.expenses && trip.expenses.length > 0 ? (
              <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
                {trip.expenses.map(exp => (
                  <li key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 500, color: 'var(--text-dark)' }}>{exp.title}</p>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px' }}>{exp.category}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Rs. {parseFloat(exp.amount).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '20px' }}>No expenses logged yet.</p>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN: ITINERARY === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="bento-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={24} color="var(--primary)"/> Trip Itinerary
              </h2>
              <button 
                onClick={handleGenerateItinerary}
                disabled={generating}
                style={{ backgroundColor: generating ? '#e2e8f0' : 'var(--primary-light)', color: generating ? 'var(--text-muted)' : 'var(--primary)', padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {generating ? <BrainCircuit size={16} className="animate-pulse" /> : <Sparkles size={16} />} 
                {generating ? 'AI is thinking...' : 'Generate AI Plan'}
              </button>
            </div>

            {trip.budget_alert && (
              <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', borderLeft: '4px solid var(--primary)', marginBottom: '24px', borderRadius: '0 8px 8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
                  <BrainCircuit size={18} />
                  <strong style={{ fontSize: '0.95rem' }}>AI Budget Insight</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>{trip.budget_alert}</p>
              </div>
            )}

            {trip.days && trip.days.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {trip.days.map(day => (
                  <div key={day.id} style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-dark)', fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      {day.date} {day.weather_condition && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>☁️ {day.weather_condition}</span>}
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {day.places && day.places.length > 0 ? (
                        day.places.map(place => <li key={place.id} style={{ color: 'var(--text-dark)' }}>{place.name}</li>)
                      ) : (
                        <li style={{ listStyle: 'none', marginLeft: '-24px', color: '#94a3b8', fontSize: '0.9rem' }}>No activities planned yet.</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Sparkles size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p style={{ margin: 0 }}>Click "Generate AI Plan" to let Gemini build your itinerary based on your budget limit.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}