import React from 'react';
import { apiUrl } from "@/lib/api";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const handleBack = () => window.history.back();
  if (!user) return <div className="text-center py-20 text-pink-600 font-bold text-xl">Please log in to view your dashboard.</div>;
    const [bookings, setBookings] = React.useState([
      { provider: 'Jane Doe', service: 'Instagram Shoutout', date: '2025-10-06', status: 'Confirmed' },
      { provider: 'John Smith', service: 'Brand Collaboration', date: '2025-10-12', status: 'Pending' },
    ]);
    React.useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await fetch(apiUrl("/api/bookings"));
          setBookings(await res.json());
        } catch {
          setBookings([
            { provider: 'Jane Doe', service: 'Instagram Shoutout', date: '2025-10-06', status: 'Confirmed' },
            { provider: 'John Smith', service: 'Brand Collaboration', date: '2025-10-12', status: 'Pending' },
          ]);
        }
      };
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }, []);
  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleBack} className="text-pink-600 hover:text-pink-800 bg-pink-100 rounded-full px-4 py-2 font-bold">Back</button>
        <button onClick={logout} className="text-pink-600 hover:text-pink-800 bg-pink-100 rounded-full px-4 py-2 font-bold">Logout</button>
      </div>
      <h1 className="text-4xl font-extrabold text-pink-700 mb-8 text-center">Welcome, {user.name}!</h1>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Your Dashboard</h2>
        <ul className="space-y-4">
          <li><Link to="/profile" className="text-pink-600 font-semibold hover:underline">View Profile</Link></li>
          <li><Link to="/booking/index" className="text-pink-600 font-semibold hover:underline">Your Bookings</Link></li>
          <li><Link to="/chat/index" className="text-pink-600 font-semibold hover:underline">Messages</Link></li>
          <li><Link to="/reviews/index" className="text-pink-600 font-semibold hover:underline">Reviews</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
