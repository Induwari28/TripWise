import { useState, useEffect } from 'react';
import { Wallet, TrendingDown, CreditCard, Receipt } from 'lucide-react';
import axios from 'axios';
import type { Trip } from '../types';

interface Props {
  token: string;
}

export default function WalletPage({ token }: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        const response = await axios.get('https://tripwise-cknt.onrender.com/api/trips/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrips(response.data);
      } catch (error) {
        console.error("Error fetching financials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancials();
  }, [token]);

  // Calculate aggregated totals
  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);
  
  const totalSpent = trips.reduce((sum, trip) => {
    const tripExpenses = trip.expenses || [];
    const tripTotal = tripExpenses.reduce((expSum: number, exp: any) => expSum + Number(exp.amount), 0);
    return sum + tripTotal;
  }, 0);

  // Extract ALL expenses into one global flat list and attach the trip name to each
  const allExpenses = trips.flatMap(trip => 
    (trip.expenses || []).map((exp: any) => ({
      ...exp,
      tripDestination: trip.destination // Keep track of which trip this belongs to!
    }))
  );

  const remainingBalance = totalBudget - totalSpent;
  const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header Card */}
      <div className="bento-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--primary), #4f46e5)', color: 'white', padding: '32px', borderRadius: '24px' }}>
        <h1 style={{ margin: '0', fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Wallet size={32} /> My Wallet
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Your global financial overview across all travel plans.</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Crunching the numbers...</p>
      ) : (
        <>
          {/* Top Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            
            {/* Total Budget */}
            <div className="bento-card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <CreditCard size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Total Allocated Budget</h3>
              </div>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                Rs. {totalBudget.toLocaleString()}
              </p>
            </div>

            {/* Total Spent */}
            <div className="bento-card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <TrendingDown size={20} color="var(--danger)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Total Spent</h3>
              </div>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                Rs. {totalSpent.toLocaleString()}
              </p>
            </div>

            {/* Remaining Balance */}
            <div className="bento-card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <Wallet size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Global Remaining</h3>
              </div>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: remainingBalance >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                Rs. {remainingBalance.toLocaleString()}
              </p>
              
              {/* Progress Bar */}
              <div style={{ width: '100%', backgroundColor: '#f3f4f6', height: '8px', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: spendingPercentage > 90 ? 'var(--danger)' : 'var(--primary)', 
                  width: `${Math.min(spendingPercentage, 100)}%`,
                  transition: 'width 0.5s ease-in-out'
                }} />
              </div>
            </div>

          </div>

          {/* Global Expense Ledger */}
          <div className="bento-card" style={{ padding: '32px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={24} color="var(--primary)" /> Global Expense Ledger
            </h2>
            
            {allExpenses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                {allExpenses.map((expense: any, index: number) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'transform 0.2s' }}>
                    <div>
                      {/* Looks for a description, title, or defaults to "Receipt Item" */}
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)', fontSize: '1rem' }}>
                        {expense.description || expense.title || expense.name || 'Receipt Item'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Trip: {expense.tripDestination}
                      </p>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1.1rem' }}>
                      Rs. {Number(expense.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <p style={{ margin: 0 }}>All of your AI-scanned receipts will aggregate here.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}