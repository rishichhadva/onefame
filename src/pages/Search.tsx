import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search as SearchIcon, MapPin, Star, Camera, Video, Palette, Sparkles } from "lucide-react";

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState([500]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");
  const [services, setServices] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Sample categories, locations, sorts
  const sampleCategories = ['Photography', 'Influencer', 'Music', 'Fitness'];
  const sampleLocations = ['Mumbai', 'Delhi', 'Bangalore', 'Remote'];
  const sampleSorts = ['Price: Low to High', 'Price: High to Low', 'Rating: High to Low'];

  // Mock data for service providers
  const providers = [
    {
      id: 1,
      name: "Alex Photography",
      service: "Photography",
      location: "Los Angeles, CA",
      rating: 4.9,
      reviews: 127,
      price: "$150/hr",
      image: "📸",
      verified: true
    },
    {
      id: 2,
      name: "Creative Videos Co.",
      service: "Videography",
      location: "New York, NY",
      rating: 4.8,
      reviews: 89,
      price: "$200/hr",
      image: "🎥",
      verified: true
    },
    {
      id: 3,
      name: "Edit Masters",
      service: "Content Editing",
      location: "Miami, FL",
      rating: 5.0,
      reviews: 156,
      price: "$75/hr",
      image: "✂️",
      verified: true
    },
    {
      id: 4,
      name: "Glam & Style Studio",
      service: "Styling & Makeup",
      location: "Chicago, IL",
      rating: 4.7,
      reviews: 94,
      price: "$100/hr",
      image: "💄",
      verified: false
    }
  ];

  const categories = [
    { name: "Photography", icon: Camera },
    { name: "Videography", icon: Video },
    { name: "Content Editing", icon: Palette },
    { name: "Styling & Makeup", icon: Sparkles }
  ];

  useEffect(() => {
    fetchAll();
  }, []);

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Search Header */}
        <section className="bg-gradient-hero border-b py-12">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Find Your Perfect <span className="bg-gradient-primary bg-clip-text text-transparent">Service Provider</span>
            </h1>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for services, providers, or specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Quick Categories */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button key={category.name} variant="secondary" size="sm">
                    <category.icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-8">
          <div className="container">
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
                <button onClick={handleApplyFilters} className="w-full px-5 py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-400 text-white font-semibold shadow hover:from-pink-600 hover:to-purple-500 transition mb-2">Apply Filters</button>
                <button onClick={handleReset} className="w-full px-5 py-2 rounded-md bg-gray-200 font-semibold shadow hover:bg-pink-100 transition mb-2">Reset</button>
              </div>
              {/* Main Search & Results */}
              <div className="flex-1">
                <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                  <div className="flex gap-4 items-center mb-4" style={{ alignItems: 'center', marginBottom: 0, marginTop: '12px' }}>
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search by category, location, budget, rating..."
                      className="w-full px-6 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-500"
                    />
                    <button
                      onClick={handleSearch}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-400 shadow hover:from-pink-600 hover:to-purple-500 transition"
                      aria-label="Search"
                      style={{ marginTop: '2px' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                  {/* Sample filters display */}
                  <div className="flex gap-2 mt-2">
                    {sampleCategories.map(c => (
                      <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-sm font-semibold ${category === c ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {services.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-400 py-10">
                      <div className="mb-4 text-lg">No results found. Here are some sample providers:</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Sample cards */}
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
                  ) : (
                    services.map(service => (
                      <div key={service.id} className="bg-white rounded-xl shadow p-4 mb-4 cursor-pointer" onClick={() => navigate(`/profile?id=${service.id}`)}>
                        <h3 className="text-xl font-bold text-pink-700">{service.name}</h3>
                        <div className="text-gray-700">Provider: {service.provider}</div>
                        <div className="text-gray-500 text-sm">{service.category} | {service.location}</div>
                        <div className="text-pink-600 font-bold">₹{service.price}</div>
                        <div className="text-yellow-500">Rating: {service.rating} ★</div>
                        <button className="mt-2 px-5 py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-400 text-white font-bold shadow hover:from-pink-600 hover:to-purple-500 transition">View Profile</button>
                      </div>
                    ))
                  )}
                </div>
                {/* Profile Card */}
                {selectedProfile && (
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
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
