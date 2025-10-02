import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sampleCategories = ['Photography', 'Influencer', 'Music', 'Fitness'];
const sampleLocations = ['Mumbai', 'Delhi', 'Bangalore', 'Remote'];
const sampleSorts = ['Price: Low to High', 'Price: High to Low', 'Rating: High to Low'];

const SearchPage = () => {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [sort, setSort] = React.useState("");
  const [services, setServices] = React.useState([]);
  const [selectedProfile, setSelectedProfile] = React.useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      // Optionally, navigate('/auth/Login');
      // But do NOT log out or clear token on navigation
    }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/services');
      setServices(await res.json());
    } catch {
      setServices([]);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/services');
      let all = await res.json();
      if (query) {
        all = all.filter(s =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          (s.provider && s.provider.toLowerCase().includes(query.toLowerCase())) ||
          s.category.toLowerCase().includes(query.toLowerCase()) ||
          s.location.toLowerCase().includes(query.toLowerCase())
        );
      }
      setServices(all);
    } catch {
      setServices([]);
    }
  };

  const handleApplyFilters = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/services');
      let all = await res.json();
      if (category) {
        all = all.filter(s => s.category === category);
      }
      if (location) {
        all = all.filter(s => s.location === location);
      }
      if (sort) {
        if (sort === 'Price: Low to High') all = all.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        if (sort === 'Price: High to Low') all = all.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        if (sort === 'Rating: High to Low') all = all.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      }
      setServices(all);
    } catch {
      setServices([]);
    }
  };

  const handleReset = async () => {
    setQuery("");
    setCategory("");
    setLocation("");
    setSort("");
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-pink-50 p-8 relative">
      <h1 className="text-4xl font-extrabold text-pink-700 mb-10 text-center">Search</h1>
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* Sidebar Filters */}
        <div className="w-full md:max-w-xs bg-white rounded-2xl shadow-lg p-6 h-fit md:sticky md:top-24">
          <h2 className="text-xl font-bold text-pink-600 mb-4">Filters</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">All</option>
              {sampleCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">All</option>
              {sampleLocations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Sort By</label>
            <select value={sort} onChange={e => setSort(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">None</option>
              {sampleSorts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={handleApplyFilters} className="w-full px-4 py-2 bg-pink-600 text-white rounded-full font-semibold shadow hover:bg-pink-700 transition mb-2">Apply</button>
          <button onClick={handleReset} className="w-full px-4 py-2 bg-gray-200 rounded-full font-semibold shadow hover:bg-pink-100 transition mb-2">Reset</button>
        </div>
        {/* Main Search & Results */}
        <div className="flex-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by category, location, budget, rating..."
                className="w-full px-6 py-3 border-2 border-pink-200 rounded-2xl mb-4 focus:outline-none focus:border-pink-500"
              />
              <button onClick={handleSearch} className="px-6 py-2 bg-pink-600 text-white rounded-full font-semibold shadow hover:bg-pink-700 transition">Search</button>
            </div>
            {/* Sample filters display */}
            <div className="flex gap-2 mt-2">
              {sampleCategories.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-sm font-semibold ${category === c ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700'}`}>{c}</button>
              ))}
            </div>
          </div>
          {selectedProfile ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl mx-auto">
              <button onClick={() => setSelectedProfile(null)} className="mb-4 px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-semibold shadow hover:bg-pink-200">Back to Search</button>
              <h2 className="text-2xl font-bold text-pink-700 mb-2">{selectedProfile.name}</h2>
              <div className="mb-2"><strong>Role:</strong> {selectedProfile.role}</div>
              <div className="mb-2"><strong>Bio:</strong> {selectedProfile.bio}</div>
              <div className="mb-2"><strong>Interests:</strong> {selectedProfile.interests}</div>
              <div className="mb-2"><strong>Skills:</strong> {selectedProfile.skills}</div>
              <div className="mb-2"><strong>Location:</strong> {selectedProfile.location}</div>
              <div className="mb-2"><strong>Experience:</strong> {selectedProfile.experience}</div>
              {selectedProfile.socials && <div className="mb-2"><strong>Socials:</strong> {selectedProfile.socials}</div>}
              {selectedProfile.services && <div className="mb-2"><strong>Services:</strong> {selectedProfile.services}</div>}
              <div className="mt-4 flex gap-4">
                <button className="px-4 py-2 bg-pink-600 text-white rounded-full font-bold shadow hover:bg-pink-700 transition">Message</button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-full font-bold shadow hover:bg-green-700 transition">Get Service</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {services.length === 0 ? (
                <>
                  {/* Sample Providers/Services if no results */}
                  <div className="col-span-3 text-center text-gray-400 py-10">
                    <div className="mb-4 text-lg">No results found. Here are some sample providers:</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
                        <img src="/placeholder.svg" alt="Sample" className="w-24 h-24 object-cover rounded-full mb-4 border-4 border-pink-200" />
                        <h3 className="font-extrabold text-xl text-pink-700 mb-2">Sample Photographer</h3>
                        <div className="text-gray-700 mb-1">Provider: Jane Doe</div>
                        <div className="text-gray-500 mb-1">Category: Photography</div>
                        <div className="text-gray-500 mb-1">Location: Mumbai</div>
                        <div className="text-pink-600 font-bold mb-1">₹1000</div>
                        <div className="text-yellow-500">Rating: 4.8 ★</div>
                      </div>
                      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
                        <img src="/placeholder.svg" alt="Sample" className="w-24 h-24 object-cover rounded-full mb-4 border-4 border-pink-200" />
                        <h3 className="font-extrabold text-xl text-pink-700 mb-2">Sample Influencer</h3>
                        <div className="text-gray-700 mb-1">Provider: John Smith</div>
                        <div className="text-gray-500 mb-1">Category: Influencer</div>
                        <div className="text-gray-500 mb-1">Location: Delhi</div>
                        <div className="text-pink-600 font-bold mb-1">₹2000</div>
                        <div className="text-yellow-500">Rating: 4.9 ★</div>
                      </div>
                      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
                        <img src="/placeholder.svg" alt="Sample" className="w-24 h-24 object-cover rounded-full mb-4 border-4 border-pink-200" />
                        <h3 className="font-extrabold text-xl text-pink-700 mb-2">Sample Fitness Coach</h3>
                        <div className="text-gray-700 mb-1">Provider: Priya Singh</div>
                        <div className="text-gray-500 mb-1">Category: Fitness</div>
                        <div className="text-gray-500 mb-1">Location: Remote</div>
                        <div className="text-pink-600 font-bold mb-1">₹1500</div>
                        <div className="text-yellow-500">Rating: 4.7 ★</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                services.map(service => (
                  <div key={service.id} className="bg-white rounded-xl shadow p-4 mb-4 cursor-pointer" onClick={() => setSelectedProfile(service)}>
                    <h3 className="text-xl font-bold text-pink-700">{service.name}</h3>
                    <div className="text-gray-700">Provider: {service.provider}</div>
                    <div className="text-gray-500 text-sm">{service.category} | {service.location}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
