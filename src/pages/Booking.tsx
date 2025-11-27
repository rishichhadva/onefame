import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, CalendarDays, Clock, ArrowRight, User, Star, MapPin, Search, MessageSquare, Image, Instagram, Eye, X, TrendingUp, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";

const fetchServices = async () => {
  const res = await fetch(apiUrl("/api/services"));
  if (!res.ok) throw new Error("Failed to load services");
  return res.json();
};

const fetchInfluencers = async () => {
  const res = await fetch(apiUrl("/api/users/influencers"));
  if (!res.ok) throw new Error("Failed to load influencers");
  return res.json();
};

const fetchProviderProfile = async (name: string) => {
  const res = await fetch(apiUrl(`/api/user/${encodeURIComponent(name)}`));
  if (!res.ok) return null;
  const profile = await res.json();
  // Parse portfolio_images if it's a string
  if (profile.portfolio_images && typeof profile.portfolio_images === 'string') {
    try {
      profile.portfolio_images = JSON.parse(profile.portfolio_images);
    } catch {
      profile.portfolio_images = [];
    }
  } else if (!profile.portfolio_images) {
    profile.portfolio_images = [];
  }
  return profile;
};

const Booking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPackage = location.state?.package;
  const initialProvider = location.state?.provider;
  
  const isProvider = user?.role === 'provider';
  
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [providerSearch, setProviderSearch] = useState("");
  const [influencerSearch, setInfluencerSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [viewingPortfolio, setViewingPortfolio] = useState<any>(null);

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services", "booking"],
    queryFn: fetchServices,
    enabled: !isProvider,
  });

  const { data: influencers = [], isLoading: influencersLoading } = useQuery({
    queryKey: ["influencers", "booking"],
    queryFn: fetchInfluencers,
    enabled: isProvider,
  });

  // Fetch profiles for all unique providers
  const uniqueProviders = Array.from(new Set(services.map((s: any) => s.provider).filter(Boolean))) as string[];
  const providerProfiles = useQuery<Record<string, any>>({
    queryKey: ["provider-profiles", uniqueProviders.join(',')],
    queryFn: async () => {
      const profiles: Record<string, any> = {};
      for (const provider of uniqueProviders) {
        if (typeof provider === 'string') {
          const profile = await fetchProviderProfile(provider);
          if (profile) {
            // Parse portfolio_images if it's a string
            if (profile.portfolio_images) {
              if (typeof profile.portfolio_images === 'string') {
                try {
                  const parsed = JSON.parse(profile.portfolio_images);
                  profile.portfolio_images = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                } catch {
                  profile.portfolio_images = profile.portfolio_images.startsWith('data:image/') ? [profile.portfolio_images] : [];
                }
              } else if (!Array.isArray(profile.portfolio_images)) {
                profile.portfolio_images = [profile.portfolio_images];
              }
            } else {
              profile.portfolio_images = [];
            }
            // Ensure username and instagram_handle exist
            if (!profile.username) profile.username = null;
            if (!profile.instagram_handle) profile.instagram_handle = null;
            profiles[provider] = profile;
          }
        }
      }
      return profiles;
    },
    enabled: uniqueProviders.length > 0 && !isProvider,
  });

  const { data: providerProfile } = useQuery({
    queryKey: ["provider-profile", selectedProvider?.provider],
    queryFn: () => fetchProviderProfile(selectedProvider?.provider || ''),
    enabled: !!selectedProvider?.provider && !isProvider,
  });

  useEffect(() => {
    if (!isProvider && initialProvider && services.length > 0) {
      const provider = services.find((s: any) => s.provider === initialProvider);
      if (provider) {
        setSelectedProvider(provider);
      }
    }
  }, [initialProvider, services, isProvider]);

  const timeSlots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "1:00 PM - 3:00 PM",
    "3:00 PM - 5:00 PM",
    "5:00 PM - 7:00 PM",
  ];

  const filteredServices = services.filter((service: any) => {
    if (!providerSearch.trim()) return true;
    const search = providerSearch.toLowerCase();
    return (
      service.provider?.toLowerCase().includes(search) ||
      service.name?.toLowerCase().includes(search) ||
      service.category?.toLowerCase().includes(search) ||
      service.location?.toLowerCase().includes(search) ||
      service.username?.toLowerCase().includes(search) ||
      (search.startsWith('@') && service.username?.toLowerCase().includes(search.slice(1)))
    );
  });

  const filteredInfluencers = influencers.filter((influencer: any) => {
    if (!influencerSearch.trim()) return true;
    const search = influencerSearch.toLowerCase();
    return (
      influencer.name?.toLowerCase().includes(search) ||
      influencer.username?.toLowerCase().includes(search) ||
      influencer.bio?.toLowerCase().includes(search) ||
      influencer.location?.toLowerCase().includes(search) ||
      influencer.interests?.toLowerCase().includes(search) ||
      (search.startsWith('@') && influencer.username?.toLowerCase().includes(search.slice(1)))
    );
  });

  // Group services by provider
  const servicesByProvider = filteredServices.reduce((acc: Record<string, any[]>, service: any) => {
    const provider = service.provider || 'Unknown';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(service);
    return acc;
  }, {});

  const handleBooking = () => {
    if (!selectedProvider && !selectedInfluencer) return;
    navigate("/checkout", { 
      state: { 
        package: selectedPackage,
        date,
        timeSlot,
        notes,
        provider: isProvider ? (selectedInfluencer?.name || selectedInfluencer?.username) : (selectedProvider?.provider || selectedProvider?.name),
        influencer: isProvider ? selectedInfluencer : null,
      } 
    });
  };

  // Show influencer selection for providers
  if (isProvider && !selectedInfluencer) {
    return (
      <div className="relative min-h-screen bg-[#030711] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-10 top-10 h-80 w-80 rounded-full bg-purple-600/30 blur-[140px]" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-[150px]" />
        </div>
        <Navbar />
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Find Influencers</p>
            <h1 className="mt-2 text-4xl font-black">Find Influencers</h1>
            <p className="mt-2 text-white/70">Discover and connect with real-time influencer accounts to offer your services</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex items-center rounded-xl border border-white/10 bg-black px-4" style={{ backgroundColor: '#000000' }}>
              <Search className="h-5 w-5 text-white/60 mr-3" />
              <input
                value={influencerSearch}
                onChange={(e) => setInfluencerSearch(e.target.value)}
                placeholder="Search influencers by name, username (@username), location, or interests..."
                style={{ color: '#ffffff' }}
                className="flex-1 h-12 bg-transparent placeholder:text-white/40 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Influencers Grid */}
          {influencersLoading ? (
            <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-12 text-center">
              <p style={{ color: '#ffffff' }} className="opacity-70">Loading influencers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInfluencers.map((influencer: any, i: number) => (
                <div
                  key={i}
                  onClick={() => setSelectedInfluencer(influencer)}
                  style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  className="rounded-2xl border p-6 shadow-lg shadow-black/40 hover:shadow-xl hover:border-purple-400/40 transition hover:-translate-y-1 cursor-pointer"
                >
                  {/* Influencer Info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    {influencer.profile_photo ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400/50 flex-shrink-0">
                        <img 
                          src={influencer.profile_photo} 
                          alt={influencer.name || 'Influencer'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(influencer.name || 'I').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p style={{ color: '#ffffff' }} className="text-sm font-semibold truncate">{influencer.name || 'Influencer'}</p>
                      {influencer.username && (
                        <p style={{ color: '#c084fc' }} className="text-xs truncate">@{influencer.username}</p>
                      )}
                    </div>
                  </div>

                  {influencer.bio && (
                    <p style={{ color: '#ffffff' }} className="text-sm opacity-80 mb-4 line-clamp-2">{influencer.bio}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {influencer.location && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#e5e7eb' }}>
                        <MapPin className="h-4 w-4 opacity-70" />
                        <span className="opacity-70">{influencer.location}</span>
                      </div>
                    )}
                    {influencer.interests && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#e5e7eb' }}>
                        <Sparkles className="h-4 w-4 opacity-70" />
                        <span className="opacity-70 truncate">{influencer.interests.split(',')[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const token = localStorage.getItem('token');
                        if (!token) {
                          alert('Please log in to start a chat');
                          return;
                        }
                        const influencerEmail = influencer.email || `${influencer.name?.toLowerCase().replace(/\s+/g, '.')}@onefame.local`;
                        const influencerName = influencer.name || influencer.username || 'Influencer';
                        
                        navigate('/chat', { 
                          state: { 
                            providerEmail: influencerEmail, 
                            providerName: influencerName 
                          } 
                        });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-purple-400/40 text-purple-300 text-sm font-semibold hover:bg-purple-400/20 transition"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInfluencer(influencer);
                      }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 text-white text-sm font-semibold shadow-md shadow-purple-900/30 transition hover:scale-105"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!influencersLoading && filteredInfluencers.length === 0 && (
            <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-12 text-center">
              <p style={{ color: '#ffffff' }} className="opacity-70">
                {influencerSearch ? 'No influencers found. Try adjusting your search.' : 'No influencers available yet.'}
              </p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // Show provider selection step if no provider is selected (for influencers)
  if (!isProvider && !selectedProvider) {
    return (
      <div className="relative min-h-screen bg-[#030711] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-10 top-10 h-80 w-80 rounded-full bg-purple-600/30 blur-[140px]" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-[150px]" />
        </div>
        <Navbar />
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Step 1 of 2</p>
            <h1 className="mt-2 text-4xl font-black">Choose a Provider</h1>
            <p className="mt-2 text-white/70">Select a service provider to continue with your booking</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex items-center rounded-xl border border-white/10 bg-black px-4" style={{ backgroundColor: '#000000' }}>
              <Search className="h-5 w-5 text-white/60 mr-3" />
              <input
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                placeholder="Search by name, username (@username), category, or location..."
                style={{ color: '#ffffff' }}
                className="flex-1 h-12 bg-transparent placeholder:text-white/40 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Provider Grid */}
          {servicesLoading ? (
            <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-12 text-center">
              <p style={{ color: '#ffffff' }} className="opacity-70">Loading providers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service: any) => {
                const providerProfileData = providerProfiles.data?.[service.provider];
                return (
                  <div
                    key={service.id || service.name}
                    onClick={() => setSelectedProvider(service)}
                    style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    className="rounded-2xl border p-6 shadow-lg shadow-black/40 hover:shadow-xl hover:border-purple-400/40 transition hover:-translate-y-1 cursor-pointer"
                  >
                    {/* Provider Info at Top */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                      {providerProfileData?.profile_photo ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400/50 flex-shrink-0">
                          <img 
                            src={providerProfileData.profile_photo} 
                            alt={service.provider || 'Provider'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {(service.provider || 'P').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p style={{ color: '#ffffff' }} className="text-sm font-semibold truncate">{service.provider}</p>
                        {providerProfileData?.username && (
                          <p style={{ color: '#c084fc' }} className="text-xs truncate">@{providerProfileData.username}</p>
                        )}
                        {providerProfileData?.instagram_handle && (
                          <div className="flex items-center gap-1 mt-1">
                            <Instagram className="h-3 w-3 text-pink-400" />
                            <a
                              href={`https://instagram.com/${providerProfileData.instagram_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#ec4899' }}
                              className="text-xs hover:underline truncate"
                            >
                              @{providerProfileData.instagram_handle}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 style={{ color: '#ffffff' }} className="text-lg font-bold mb-1">{service.name}</h3>
                        <p style={{ color: '#ffffff' }} className="text-sm opacity-80 font-medium">
                          {service.category || "Service"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: '#fbbf24' }}>
                        <Star className="h-4 w-4 fill-current" />
                        <span style={{ color: '#ffffff' }} className="text-sm font-semibold">{service.rating || "4.8"}</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#e5e7eb' }}>
                        <MapPin className="h-4 w-4 opacity-70" />
                        <span className="opacity-70">{service.location || "Remote"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <span style={{ color: '#c084fc' }} className="text-xl font-bold">₹{service.price}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(() => {
                          if (!providerProfileData) return null;
                          const portfolioImages = providerProfileData.portfolio_images;
                          let hasPortfolio = false;
                          
                          if (portfolioImages) {
                            if (Array.isArray(portfolioImages)) {
                              hasPortfolio = portfolioImages.length > 0;
                            } else if (typeof portfolioImages === 'string') {
                              try {
                                const parsed = JSON.parse(portfolioImages);
                                hasPortfolio = Array.isArray(parsed) ? parsed.length > 0 : parsed.length > 0;
                              } catch {
                                hasPortfolio = portfolioImages.startsWith('data:image/') && portfolioImages.length > 100;
                              }
                            }
                          }
                          
                          return hasPortfolio ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingPortfolio(providerProfileData);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-cyan-400/40 text-cyan-300 text-sm font-semibold hover:bg-cyan-400/20 transition"
                              title="View Portfolio"
                            >
                              <Eye className="h-4 w-4" />
                              Portfolio
                            </button>
                          ) : null;
                        })()}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const token = localStorage.getItem('token');
                            if (!token) {
                              alert('Please log in to start a chat');
                              return;
                            }
                            const providerEmail = service.provider?.toLowerCase().replace(/\s+/g, '.') + '@onefame.local';
                            const providerName = service.provider || service.name;
                            
                            navigate('/chat', { 
                              state: { 
                                providerEmail, 
                                providerName 
                              } 
                            });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-purple-400/40 text-purple-300 text-sm font-semibold hover:bg-purple-400/20 transition"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProvider(service);
                          }}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 text-white text-sm font-semibold shadow-md shadow-purple-900/30 transition hover:scale-105"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!servicesLoading && filteredServices.length === 0 && (
            <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-12 text-center">
              <p style={{ color: '#ffffff' }} className="opacity-70">No providers found. Try adjusting your search.</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // Booking form (for both providers and influencers)
  const selectedEntity = isProvider ? selectedInfluencer : selectedProvider;
  const entityName = isProvider ? (selectedInfluencer?.name || selectedInfluencer?.username || 'Influencer') : (selectedProvider?.provider || selectedProvider?.name);

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-10 top-10 h-80 w-80 rounded-full bg-purple-600/30 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-[150px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Step 2 of 2</p>
          <h1 className="mt-2 text-4xl font-black">
            {isProvider ? 'Offer Service to' : 'Book with'} {entityName}
          </h1>
          <p className="mt-2 text-white/70">
            {isProvider ? 'Complete the details to offer your service' : 'Complete your booking details'}
          </p>
        </div>

        <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-8 shadow-lg shadow-black/40">
          <div className="space-y-6">
            <div>
              <Label className="text-white/80 mb-2 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg border border-white/10 bg-black/50"
              />
            </div>

            <div>
              <Label className="text-white/80 mb-2 block">Time Slot</Label>
              <RadioGroup value={timeSlot} onValueChange={setTimeSlot}>
                {timeSlots.map((slot) => (
                  <div key={slot} className="flex items-center space-x-2">
                    <RadioGroupItem value={slot} id={slot} className="border-white/30" />
                    <Label htmlFor={slot} className="text-white/90 cursor-pointer">
                      {slot}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-white/80 mb-2 block">Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isProvider ? "Describe the service you're offering..." : "Any special requirements or notes..."}
                className="bg-black/50 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
              />
            </div>

            <button
              onClick={handleBooking}
              disabled={!date || !timeSlot}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 text-white font-bold shadow-md shadow-purple-900/30 transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isProvider ? 'Offer Service' : 'Proceed to Checkout'}
              <ArrowRight className="inline ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
      <Footer />

      {/* Portfolio Modal */}
      {viewingPortfolio && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#030711] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Portfolio</h2>
              <button
                onClick={() => setViewingPortfolio(null)}
                className="text-white/60 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {viewingPortfolio.portfolio_images && viewingPortfolio.portfolio_images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {viewingPortfolio.portfolio_images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10">
                    <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-8">No portfolio images available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
