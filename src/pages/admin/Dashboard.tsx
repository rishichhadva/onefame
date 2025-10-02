import React, { useEffect, useState } from 'react';

const AdminDashboard: React.FC = () => {
  const handleBack = () => window.history.back();
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalServices: 0 });
  const [viewCount, setViewCount] = useState(0);
  const [activeProviders, setActiveProviders] = useState(0);
  const [activeInfluencers, setActiveInfluencers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Replace with your backend API endpoints
      try {
        const usersRes = await fetch('http://localhost:4000/api/users');
        const usersData = await usersRes.json();
        setUsers(usersData);
        const servicesRes = await fetch('http://localhost:4000/api/services');
        const servicesData = await servicesRes.json();
        setServices(servicesData);
        setStats({ totalUsers: usersData.length, totalServices: servicesData.length });
      } catch {
        // fallback to static data if error
        setUsers([
          { name: 'Admin', email: 'admin@onefame.com', role: 'admin' },
          { name: 'Jane Doe', email: 'jane@onefame.com', role: 'influencer' },
          { name: 'John Smith', email: 'john@onefame.com', role: 'provider' },
        ]);
        setServices([
          { name: 'Instagram Shoutout', category: 'Social Media' },
          { name: 'Brand Collaboration', category: 'Marketing' },
        ]);
        setStats({ totalUsers: 3, totalServices: 2 });
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch new users
    fetch('http://localhost:4000/api/admin/new-users')
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
    // Fetch analytics
    fetch('http://localhost:4000/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        setViewCount(data.viewCount || 0);
        setActiveProviders(data.activeProviders || 0);
        setActiveInfluencers(data.activeInfluencers || 0);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white flex flex-col items-center py-12">
      <div className="w-full max-w-5xl p-8 bg-white rounded-3xl shadow-2xl">
        <div className="flex justify-start mb-6">
          <button onClick={handleBack} className="text-pink-600 hover:text-pink-800 bg-pink-100 rounded-full px-4 py-2 font-bold">Back</button>
        </div>
        <h1 className="text-4xl font-extrabold text-pink-700 mb-8 text-center tracking-tight">Admin Dashboard</h1>
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-pink-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{viewCount}</div>
            <div className="text-gray-700">Website Views</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{activeProviders}</div>
            <div className="text-gray-700">Active Providers</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeInfluencers}</div>
            <div className="text-gray-700">Active Influencers</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-pink-700 mb-4">User Management</h3>
            <ul>
              {users.map((user, i) => (
                <li key={i} className="flex items-center justify-between py-2 border-b border-pink-100">
                  <span className="font-semibold text-pink-600">{user.name}</span>
                  <span className="text-sm text-gray-500">{user.email}</span>
                  <span className="px-2 py-1 rounded bg-pink-100 text-pink-700 text-xs font-bold">{user.role}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-pink-700 mb-4">Services Overview</h3>
            <ul>
              {services.map((service, i) => (
                <li key={i} className="flex items-center justify-between py-2 border-b border-pink-100">
                  <span className="font-semibold text-pink-600">{service.name}</span>
                  <span className="text-sm text-gray-500">{service.category}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4 text-pink-700">New Users</h3>
          <ul className="space-y-2">
            {users.map(u => (
              <li key={u.email} className="bg-pink-100 rounded-lg px-4 py-2 flex justify-between items-center">
                <span className="font-semibold text-pink-700">{u.name}</span>
                <span className="text-gray-600">{u.email}</span>
                <span className="text-xs px-2 py-1 rounded bg-pink-200 text-pink-800">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
