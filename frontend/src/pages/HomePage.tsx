import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { Trip } from '../types';
import TripMap from '../components/TripMap';
import { MapPin, Calendar, DollarSign, Sparkles, Navigation, ArrowRight } from 'lucide-react';

interface Props {
  trips: Trip[];
  setTrips: (trips: Trip[]) => void;
  token: string;
}

export default function HomePage({ trips, setTrips, token }: Props) {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const handleCreateTrip = (e: FormEvent) => {
    e.preventDefault();
    const newTrip = { destination, start_date: startDate, end_date: endDate, budget, number_of_people: 1 };

    axios.post(`${API_BASE_URL}/trips/`, newTrip, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setTrips([...trips, response.data]);
        setDestination(''); setStartDate(''); setEndDate(''); setBudget('');
      })
      .catch(error => console.error(error));
  };

  // 4. Filter trips based on search query and prepare display lists
  const filteredTrips = trips.filter((trip) =>
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const featuredTrip = filteredTrips.length > 0 ? filteredTrips[filteredTrips.length - 1] : null;
  const upcomingTrips = filteredTrips.length > 1 ? filteredTrips.slice(0, filteredTrips.length - 1).reverse() : [];

  return (
    <div className="home-page">
      <div className="home-page__left-column">
        {featuredTrip ? (
          <article className="bento-card featured-trip-card">
            <div className="featured-trip-card__orb" aria-hidden="true" />

            <div className="featured-trip-card__content">
              <span className="featured-trip-card__badge">Featured Plan</span>
              <h2 className="featured-trip-card__title">{featuredTrip.destination}</h2>
              <div className="featured-trip-card__location">
                <MapPin size={16} /> Listed site with majestic views
              </div>
            </div>

            <div className="featured-trip-card__footer">
              <div className="featured-trip-card__budget">
                <p>Budget Estimation</p>
                <h3>Rs. {parseFloat(featuredTrip.budget).toLocaleString()}</h3>
              </div>
              <Link className="featured-trip-card__link" to={`/trip/${featuredTrip.id}`}>
                See Details <ArrowRight size={18} />
              </Link>
            </div>
          </article>
        ) : (
          <div className="bento-card home-page__empty-feature">
            {searchQuery ? (
              <h2>No trips found matching "{searchQuery}"</h2>
            ) : (
              <h2>Create a trip to see your featured plan!</h2>
            )}
          </div>
        )}

        <section className="bento-card map-bento-card">
          <div className="map-bento-card__header">
            <h3>Location Overview</h3>
            <span className="map-bento-card__expand">Expand Map</span>
          </div>
          <div className="map-bento-card__map">
            <TripMap trips={filteredTrips} />
          </div>
        </section>
      </div>

      <div className="home-page__right-column">
        <section className="bento-card dream-form-card">
          <h3 className="dream-form-card__title">Find Your Dream</h3>
          <p className="dream-form-card__subtitle">AI designs the best itinerary for you</p>

          <form className="dream-form" onSubmit={handleCreateTrip}>
            <div className="dream-form__input-wrap dream-form__input-wrap--icon">
              <Navigation size={18} color="var(--primary)" className="dream-form__icon" />
              <input className="dream-form__input" type="text" placeholder="e.g. Beautiful beach in Bali" value={destination} onChange={(e) => setDestination(e.target.value)} required />
            </div>

            <div className="dream-form__date-grid">
              <div className="dream-form__input-wrap dream-form__input-wrap--icon">
                <Calendar size={18} color="var(--text-muted)" className="dream-form__icon" />
                <input className="dream-form__input dream-form__input--date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="dream-form__input-wrap dream-form__input-wrap--icon dream-form__input-wrap--end">
                <input className="dream-form__input dream-form__input--date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>

            <div className="dream-form__input-wrap dream-form__input-wrap--icon">
              <DollarSign size={18} color="var(--text-muted)" className="dream-form__icon" />
              <input className="dream-form__input" type="number" placeholder="Budget limit (Rs.)" value={budget} onChange={(e) => setBudget(e.target.value)} required />
            </div>

            <button className="dream-form__submit" type="submit">
              <Sparkles size={18} /> Generate Dream Trip
            </button>
          </form>
        </section>

        <section className="bento-card home-schedule-card">
          <div className="home-schedule-card__header">
            <h3>My Schedule</h3>
            <span className="home-schedule-card__see-all">See All</span>
          </div>

          <div className="home-schedule-card__list">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => (
                <div className="home-schedule-card__trip" key={trip.id}>
                  <div className="home-schedule-card__trip-copy">
                    <h4>{trip.destination}</h4>
                    <p>
                      <Calendar size={12} className="home-schedule-card__calendar" />
                      {trip.start_date} to {trip.end_date}
                    </p>
                  </div>
                  <Link className="home-schedule-card__arrow" to={`/trip/${trip.id}`}>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <p className="home-schedule-card__empty">
                {searchQuery ? "No matches found." : "No other upcoming trips."}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}