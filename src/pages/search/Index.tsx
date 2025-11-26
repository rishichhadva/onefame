import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Filter,
  MapPin,
  Search as SearchIcon,
  Star,
  X,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fetchServices = async () => {
  const res = await fetch("http://localhost:4000/api/services");
  if (!res.ok) throw new Error("Failed to load services");
  return res.json();
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortFilter, setSortFilter] = useState("None");
  const [selected, setSelected] = useState<any | null>(null);

  const { data: services = [], isLoading, isError } = useQuery({
    queryKey: ["services", "marketplace"],
    queryFn: fetchServices,
  });

  const categories = useMemo(() => {
    const unique = new Set(services.map((s: any) => s.category).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [services]);

  const locations = useMemo(() => {
    const unique = new Set(services.map((s: any) => s.location).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [services]);

  const quickFilters = ["Photography", "Influencer", "Music", "Fitness"];

  const filtered = useMemo(() => {
    let results = [...services];
    
    if (query.trim()) {
      results = results.filter((service: any) => {
        const haystack = `${service.name} ${service.provider} ${service.category} ${service.location} ${service.price}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      });
    }
    
    if (categoryFilter !== "All") {
      results = results.filter((service: any) => service.category === categoryFilter);
    }
    
    if (locationFilter !== "All") {
      results = results.filter((service: any) => service.location === locationFilter);
    }
    
    results = results.sort((a: any, b: any) => {
      if (sortFilter === "Price Low to High") return parseFloat(a.price) - parseFloat(b.price);
      if (sortFilter === "Price High to Low") return parseFloat(b.price) - parseFloat(a.price);
      if (sortFilter === "Rating") return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      return 0;
    });
    
    return results;
  }, [services, query, categoryFilter, locationFilter, sortFilter]);

  const handleApplyFilters = () => {
    // Filters are already applied via useMemo
  };

  const handleReset = () => {
    setCategoryFilter("All");
    setLocationFilter("All");
    setSortFilter("None");
    setQuery("");
  };

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="space-y-6">
            <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-6 shadow-xl">
              <h2 style={{ color: '#ffffff' }} className="text-xl font-bold mb-6">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label style={{ color: '#ffffff' }} className="block text-sm font-bold mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ 
                      color: '#ffffff', 
                      backgroundColor: '#030711',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                    className="w-full rounded-lg border px-4 py-2.5 focus:border-purple-400 focus:outline-none font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} style={{ backgroundColor: '#030711', color: '#ffffff' }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ color: '#ffffff' }} className="block text-sm font-bold mb-2">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    style={{ 
                      color: '#ffffff', 
                      backgroundColor: '#030711',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                    className="w-full rounded-lg border px-4 py-2.5 focus:border-purple-400 focus:outline-none font-semibold"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc} style={{ backgroundColor: '#030711', color: '#ffffff' }}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ color: '#ffffff' }} className="block text-sm font-bold mb-2">Sort By</label>
                  <select
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                    style={{ 
                      color: '#ffffff', 
                      backgroundColor: '#030711',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                    className="w-full rounded-lg border px-4 py-2.5 focus:border-purple-400 focus:outline-none font-semibold"
                  >
                    <option value="None" style={{ backgroundColor: '#030711', color: '#ffffff' }}>None</option>
                    <option value="Price Low to High" style={{ backgroundColor: '#030711', color: '#ffffff' }}>Price Low to High</option>
                    <option value="Price High to Low" style={{ backgroundColor: '#030711', color: '#ffffff' }}>Price High to Low</option>
                    <option value="Rating" style={{ backgroundColor: '#030711', color: '#ffffff' }}>Rating</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleApplyFilters}
                  className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-105"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleReset}
                  style={{ backgroundColor: '#030711', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4 inline mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </aside>

          {/* Right Content - Search and Results */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="flex-1 flex items-center rounded-xl border px-4">
                <SearchIcon style={{ color: '#ffffff' }} className="h-5 w-5 mr-3 opacity-60" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by category, location, budget, rating..."
                  style={{ color: '#ffffff' }}
                  className="flex-1 h-12 bg-transparent placeholder:text-white/40 focus:outline-none font-medium"
                />
              </div>
              <button className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-400 p-3 text-white shadow-lg shadow-purple-900/40 transition hover:scale-105">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-3">
              {quickFilters.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setCategoryFilter(tag);
                    setQuery("");
                  }}
                  style={{
                    backgroundColor: categoryFilter === tag ? '#a855f7' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition border ${
                    categoryFilter === tag ? 'font-semibold' : 'hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            {isLoading && (
              <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-12 text-center">
                <span style={{ color: '#ffffff' }} className="opacity-70">Loading services...</span>
              </div>
            )}
            
            {isError && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-50">
                Couldn't load services. Please try again.
              </div>
            )}
            
            {!isLoading && !isError && filtered.length === 0 && (
              <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-12 text-center">
                <span style={{ color: '#ffffff' }} className="opacity-70">No services found. Try adjusting your filters.</span>
              </div>
            )}
            
            {!isLoading && !isError && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((service: any) => (
                  <div
                    key={service.id || service.name}
                    style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    className="group rounded-2xl border p-6 shadow-lg shadow-black/40 hover:shadow-xl hover:border-purple-400/40 transition hover:-translate-y-1 cursor-pointer"
                    onClick={() => setSelected(service)}
                  >
                    <h3 style={{ color: '#ffffff' }} className="text-lg font-bold mb-1">{service.name}</h3>
                    <p style={{ color: '#ffffff' }} className="text-sm mb-3 font-medium opacity-90">Provider: {service.provider}</p>
                    <p style={{ color: '#e5e7eb' }} className="text-xs mb-4 uppercase tracking-wide opacity-70">
                      {service.category || "General"} | {service.location || "Remote"}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1" style={{ color: '#fbbf24' }}>
                        <Star className="h-4 w-4 fill-current" />
                        <span style={{ color: '#ffffff' }} className="text-sm font-semibold">Rating: {service.rating || "4.8"}</span>
                      </div>
                      <span style={{ color: '#c084fc' }} className="text-lg font-bold">₹{service.price}</span>
                    </div>
                    <button className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-900/30 transition hover:scale-105">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur">
          <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.15)' }} className="relative w-full max-w-3xl rounded-2xl border p-8 shadow-2xl">
            <button
              onClick={() => setSelected(null)}
              style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              className="absolute right-6 top-6 rounded-full border p-2 text-white/70 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-2">Profile</p>
                <h2 style={{ color: '#ffffff' }} className="text-3xl font-bold mb-2">{selected.name}</h2>
                <p style={{ color: '#ffffff' }} className="opacity-70 mb-6">{selected.provider}</p>
                <div className="space-y-3 text-sm" style={{ color: '#ffffff' }}>
                  <p className="opacity-80">
                    <span className="opacity-50">Category:</span> {selected.category || "General"}
                  </p>
                  <p className="opacity-80">
                    <span className="opacity-50">Location:</span> {selected.location || "Remote"}
                  </p>
                  <p className="opacity-80">
                    <span className="opacity-50">Services:</span> {selected.services || selected.name}
                  </p>
                  <p className="opacity-80">
                    <span className="opacity-50">Starting at:</span> ₹{selected.price}
                  </p>
                  <p className="opacity-80">
                    <span className="opacity-50">Rating:</span> {selected.rating || "4.9"} / 5
                  </p>
                </div>
              </div>
              <div style={{ backgroundColor: '#030711', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-6">
                <p style={{ color: '#ffffff' }} className="text-sm mb-6 opacity-70">
                  Ready to collaborate? Lock dates, send briefs, or just start a chat.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate("/booking", { state: { provider: selected.provider } });
                      setSelected(null);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-400 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-105"
                  >
                    Book this creator
                  </button>
                  <button
                    onClick={() => {
                      navigate("/chat/index");
                      setSelected(null);
                    }}
                    style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                    className="w-full rounded-xl border px-4 py-3 text-center font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    Start a chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SearchPage;
