import { Outlet, Link } from 'react-router-dom';

interface Props {
  onLogout: () => void;
}

export default function MainLayout({ onLogout }: Props) {
  return (
    <div className="app-container">
      {/* Your existing header design */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <h1 style={{ margin: 0 }}>TripWise Dashboard</h1>
        </Link>
        <button 
          onClick={onLogout} 
          style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>
      
      {/* This is where the page content will be injected */}
      <Outlet /> 
    </div>
  );
}