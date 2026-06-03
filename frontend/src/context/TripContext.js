import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const TripContext = createContext();
export const useTrips = () => useContext(TripContext);

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', search: '', sort: 'newest' });

  const fetchTrips = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ...filter, ...params }).toString();
      const { data } = await axios.get(`/api/trips?${query}`);
      setTrips(data.trips);
    } catch (err) {
      console.error('Fetch trips error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/trips/meta/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, []);

  const createTrip = async (tripData) => {
    const { data } = await axios.post('/api/trips', tripData);
    setTrips(prev => [data.trip, ...prev]);
    fetchStats();
    return data.trip;
  };

  const updateTrip = async (id, updates) => {
    const { data } = await axios.put(`/api/trips/${id}`, updates);
    setTrips(prev => prev.map(t => t._id === id ? data.trip : t));
    return data.trip;
  };

  const deleteTrip = async (id) => {
    await axios.delete(`/api/trips/${id}`);
    setTrips(prev => prev.filter(t => t._id !== id));
    fetchStats();
  };

  const toggleChecklistItem = async (tripId, itemId) => {
    const { data } = await axios.patch(`/api/trips/${tripId}/checklist/${itemId}`);
    setTrips(prev => prev.map(t => t._id === tripId ? data.trip : t));
    return data.trip;
  };

  const addChecklistItem = async (tripId, text, category) => {
    const { data } = await axios.post(`/api/trips/${tripId}/checklist`, { text, category });
    setTrips(prev => prev.map(t => t._id === tripId ? data.trip : t));
    return data.trip;
  };

  const deleteChecklistItem = async (tripId, itemId) => {
    const { data } = await axios.delete(`/api/trips/${tripId}/checklist/${itemId}`);
    setTrips(prev => prev.map(t => t._id === tripId ? data.trip : t));
    return data.trip;
  };

  const togglePin = async (id) => {
    const { data } = await axios.patch(`/api/trips/${id}/pin`);
    setTrips(prev => prev.map(t => t._id === id ? data.trip : t));
  };

  const toggleArchive = async (id) => {
    const { data } = await axios.patch(`/api/trips/${id}/archive`);
    setTrips(prev => prev.filter(t => t._id !== id));
    fetchStats();
  };

  const updateStatus = async (id, status) => {
    const { data } = await axios.patch(`/api/trips/${id}/status`, { status });
    setTrips(prev => prev.map(t => t._id === id ? data.trip : t));
    fetchStats();
  };

  return (
    <TripContext.Provider value={{
      trips, stats, loading, filter, setFilter,
      fetchTrips, fetchStats, createTrip, updateTrip, deleteTrip,
      toggleChecklistItem, addChecklistItem, deleteChecklistItem,
      togglePin, toggleArchive, updateStatus
    }}>
      {children}
    </TripContext.Provider>
  );
};
