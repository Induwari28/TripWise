import { useState, useEffect } from 'react';
import { Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FavoritesPage() {
  // 1. Load from localStorage on initial render
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem('tripwise_favorites');
    // If there's saved data, parse it. Otherwise, start with an empty array.
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Automatically save to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('tripwise_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Function to remove a favorite
  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  return (
    <div className="favorites-page" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header Card */}
      <div className="bento-card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, var(--danger), #f43f5e)', color: 'white', padding: '32px', borderRadius: '24px' }}>
        <h1 style={{ margin: '0', fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Heart size={32} fill="currentColor" /> My Favorites
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Your curated collection of dream destinations and saved spots.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="bento-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', borderRadius: '24px', backgroundColor: 'white' }}>
          <Heart size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto', display: 'block' }} />
          <h2>No favorites yet!</h2>
          <p>Start clicking the heart icon on destinations to save them here.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {favorites.map((place) => (
            <div key={place.id} className="bento-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative' }}>
              
              {/* Floating Heart Button */}
              <button 
                onClick={() => removeFavorite(place.id)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                title="Remove from favorites"
              >
                <Heart size={24} fill="currentColor" />
              </button>

              {/* Card Title & Location */}
              <div style={{ paddingRight: '32px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--text-dark)' }}>
                  {place.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  <MapPin size={16} />
                  <span>{place.location}</span>
                </div>
              </div>

              {/* Rating & Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Star size={14} fill="currentColor" /> {place.rating}
                </div>
                {place.tags.map((tag: string) => (
                  <span key={tag} style={{ backgroundColor: '#f3f4f6', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Navigation Button */}
              <Link 
                to="/" 
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
                Plan a Trip Here <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}