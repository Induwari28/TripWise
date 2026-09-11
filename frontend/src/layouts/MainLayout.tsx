import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Heart, Ticket, Wallet, Settings, Search, LogOut } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export default function MainLayout({ onLogout }: Props) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* --- LEFT SIDEBAR --- */}
      {/* 2. Added className="sidebar" */}
      <aside className="sidebar" style={{ 
        width: '260px', 
        backgroundColor: 'var(--bg-sidebar)', 
        borderRight: '1px solid var(--border-color)',
        display: 'flex', 
        flexDirection: 'column', 
        padding: '24px 16px' 
      }}>
        {/* Logo */}
        {/* 3. Added className="sidebar-header" */}
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
            W
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>TripWise</h2>
        </div>

        {/* Navigation Icons */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink to="/" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none', color: isActive ? 'white' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--primary)' : 'transparent', fontWeight: 500, transition: 'all 0.2s'
          })}>
            {/* Wrapped text in <span> */}
            <Home size={22} /> <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/my-trips" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none', color: isActive ? 'white' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--primary)' : 'transparent', fontWeight: 500, transition: 'all 0.2s'
          })}>
            {/* Wrapped text in <span> */}
            <Ticket size={22} /> <span>My Trips</span>
          </NavLink>

          <NavLink to="/wallet" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none', color: isActive ? 'white' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--primary)' : 'transparent', fontWeight: 500, transition: 'all 0.2s'
          })}>
            {/* Wrapped text in <span> */}
            <Wallet size={22} /> <span>Wallet</span>
          </NavLink>

          <NavLink to="/favorites" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none', color: isActive ? 'white' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--primary)' : 'transparent', fontWeight: 500, transition: 'all 0.2s'
          })}>
            {/* Wrapped text in <span> */}
            <Heart size={22} /> <span>Favorites</span>
          </NavLink>

          <NavLink to="/settings" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none', color: isActive ? 'white' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--primary)' : 'transparent', fontWeight: 500, transition: 'all 0.2s'
          })}>
            {/* Wrapped text in <span> */}
            <Settings size={22} /> <span>Settings</span>
          </NavLink>
        </nav>

        {/* Promo Card & Logout */}
        {/* 4. Added className="sidebar-promo" */}
        <div className="sidebar-promo" style={{ marginTop: 'auto' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.4)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Travel Like a Pro</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', opacity: 0.9 }}>AI will put together a dream trip that feels like destiny.</p>
            <button 
                 onClick={() => navigate('/')}
                 style={{ backgroundColor: 'white', color: 'var(--primary)', border: 'none', width: '100%', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Booking Now
            </button>
          </div>
          
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '14px', border: 'none', backgroundColor: '#fef2f2', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        {/* 5. Added className="top-header" */}
        <header className="top-header" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'var(--bg-app)' }}>
          
          {/* Greeting */}
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 4px 0', color: 'var(--text-dark)' }}>Hi, Induwari!</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>Welcome back and explore the world</p>
          </div>

          {/* Search Bar */}
          {/* 6. Added className="search-bar" */}
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '12px 20px', borderRadius: '30px', width: '350px', boxShadow: 'var(--shadow-sm)' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
            <input 
              type="text" 
              placeholder="Search Destination..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: 'var(--text-dark)' }} 
            />
          </div>

          {/* Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-dark)' }}>Induwari</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Account</p>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              IN
            </div>
          </div>
        </header>

        {/* Page Content Injection */}
        {/* 7. Added className="main-content" */}
        <main className="main-content" style={{ flex: 1, padding: '0 40px 40px 40px', overflowY: 'auto' }}>
          <Outlet context={{ searchQuery }} />
        </main>

      </div>
    </div>
  )
}