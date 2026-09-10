import { useEffect, useState } from 'react';
import { Settings, User, Bell, Shield, Moon, Save } from 'lucide-react';
import axios from 'axios';

interface Props {
  token: string;
}

export default function SettingsPage({ token }: Props) {
  // Form state for user preferences
  const [profile, setProfile] = useState({
    name: 'Induwari',
    email: '',
    currency: 'LKR (Rs.)',
    notifications: true,
    darkMode: false,
  });

  useEffect(() => {
    axios.get('https://tripwise-cknt.onrender.com/api/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        setProfile((current) => ({
          ...current,
          name: data.username || current.name,
          email: data.email || '',
        }));
      })
      .catch((error) => console.error('Error loading profile:', error));
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch('https://tripwise-cknt.onrender.com/api/profile/', {
        email: profile.email,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Settings saved successfully!');
    } catch (error) {
      const message = axios.isAxiosError(error) && typeof error.response?.data?.error === 'string'
        ? error.response.data.error
        : 'Unable to save settings.';
      alert(message);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header Card */}
      <div className="bento-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--primary), #4f46e5)', color: 'white', padding: '32px', borderRadius: '24px' }}>
        <h1 style={{ margin: '0', fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={32} /> Settings
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Manage your profile, preferences, and account security.</p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          {/* Profile Details */}
          <div className="bento-card" style={{ padding: '32px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={24} color="var(--primary)" /> Profile Details
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Display Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  required
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: '#f9fafb', color: 'var(--text-muted)', outline: 'none' }}
                />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>You can update this email address at any time.</small>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bento-card" style={{ padding: '32px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={24} color="var(--primary)" /> App Preferences
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: 'var(--danger)', borderRadius: '10px' }}><Bell size={20} /></div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-dark)' }}>Push Notifications</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Trip reminders and budget alerts</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={profile.notifications}
                  onChange={(e) => setProfile({...profile, notifications: e.target.checked})}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px' }}><Moon size={20} /></div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-dark)' }}>Dark Mode</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toggle application theme</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={profile.darkMode}
                  onChange={(e) => setProfile({...profile, darkMode: e.target.checked})}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Default Currency</label>
                <select 
                  value={profile.currency}
                  onChange={(e) => setProfile({...profile, currency: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="LKR (Rs.)">Sri Lankan Rupee (LKR)</option>
                  <option value="USD ($)">US Dollar (USD)</option>
                  <option value="EUR (€)">Euro (EUR)</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
          >
            <Save size={20} /> Save Changes
          </button>
        </div>
      </form>

    </div>
  );
}