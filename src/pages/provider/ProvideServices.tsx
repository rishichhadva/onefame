import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, DollarSign, MapPin, Tag, MessageSquare, Plus, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '@/lib/api';

const ProvideServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const editingService = location.state?.service;
  const [offering, setOffering] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [locationField, setLocationField] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [popup, setPopup] = useState('');

  useEffect(() => {
    if (editingService) {
      setOffering(editingService.name || '');
      setDesc(editingService.description || '');
      setCategory(editingService.category || '');
      setPrice(editingService.price?.replace('₹', '') || '');
      setLocationField(editingService.location || '');
      setContactInfo(editingService.contactInfo || '');
    }
  }, [editingService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopup('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPopup('Please login to post an offering');
        return;
      }
      
      if (editingService) {
        // Update existing service
        const res = await fetch(apiUrl(`/api/services/${editingService.id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: offering,
            category,
            price: price.toString(),
            location: locationField,
            status: editingService.status || 'Active'
          })
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update service');
        }
        
        setPopup('Service updated successfully!');
      } else {
        // Create new service
        const res = await fetch(apiUrl("/api/services"), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: offering,
            provider: user?.name || user?.email,
            price: price.toString(),
            status: 'Active',
            category: category || 'General',
            location: locationField || 'Remote',
            rating: '5.0',
            image: '/placeholder.svg'
          })
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to post service');
        }
        
        setPopup('Offering posted successfully!');
      }
      
      setTimeout(() => {
        setOffering('');
        setDesc('');
        setCategory('');
        setPrice('');
        setLocationField('');
        setContactInfo('');
        navigate('/provider/dashboard');
      }, 1500);
    } catch (err: any) {
      setPopup(err.message || 'Failed to post offering');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030711] text-white overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        {/* Top Navigation */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Main Form Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl shadow-black/40 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 p-2">
                {editingService ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
              </div>
              <h2 className="text-2xl font-black text-white">
                {editingService ? 'Edit Service' : 'Post a New Offering'}
              </h2>
            </div>
            <p className="text-sm text-white/60">
              {editingService ? 'Update your service listing' : 'Create a new service listing to attract clients'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Offering Title */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-300" />
                Offering Title
              </label>
              <input
                type="text"
                value={offering}
                onChange={e => setOffering(e.target.value)}
                placeholder="e.g., Professional Photography Services"
                required
                className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder:text-white/40 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-300" />
                Offering Description
              </label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe your service in detail. What makes it special? What do you offer?"
                required
                rows={4}
                className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder:text-white/40 transition resize-none"
              />
            </div>

            {/* Category and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-300" />
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g., Photography, Videography"
                  required
                  className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder:text-white/40 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-300" />
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder:text-white/40 transition"
                />
              </div>
            </div>

            {/* Location and Contact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  Location
                </label>
                <input
                  type="text"
                  value={locationField}
                  onChange={e => setLocationField(e.target.value)}
                  placeholder="e.g., Mumbai, Remote"
                  required
                  className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder:text-white/40 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-300" />
                  Contact Info
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  placeholder="Email or phone"
                  required
                  className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder:text-white/40 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-400 text-white rounded-xl font-bold shadow-lg shadow-purple-900/40 transition hover:scale-[1.02]"
            >
              {editingService ? 'Update Service' : 'Post Offering'}
            </button>

            {/* Success/Error Message */}
            {popup && (
              <div className={`px-4 py-3 rounded-xl text-center ${
                popup.includes('successfully') || popup.includes('posted')
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {popup}
              </div>
            )}
          </form>

          {/* Help Text */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">
              <strong className="text-white/80">Tip:</strong> Be specific about what you offer. Include details about your experience, portfolio highlights, and what makes your service unique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvideServices;
