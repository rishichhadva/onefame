import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Users,
  Briefcase,
  TrendingUp,
  Eye,
  Shield,
  Activity,
  ArrowRight,
  UserPlus,
  FileText,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  CalendarDays,
  Edit,
  Trash2,
  Search,
  X,
  Save,
} from 'lucide-react';

const API_BASE = "http://localhost:4000";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️  No token found in localStorage');
    return {
      'Content-Type': 'application/json',
    };
  }
  
  // Validate token format (JWT should have 3 parts separated by dots)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    console.error('✗ Invalid token format - not a valid JWT');
    console.error('Token preview:', token.substring(0, 20) + '...');
    // Clear invalid token
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
    return {
      'Content-Type': 'application/json',
    };
  }
  
  console.log('✓ Valid JWT token found, length:', token.length);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const fetchAllUsers = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const headers = getAuthHeaders();
    console.log('Fetching users from:', `${API_BASE}/api/admin/users`);
    console.log('Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'missing' });
    
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    console.log('Response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      if (res.status === 403) throw new Error('Admin access required');
      if (res.status === 401) throw new Error('Authentication required');
      throw new Error(`Failed to load users: ${res.status} - ${errorText.substring(0, 100)}`);
    }
    const data = await res.json();
    console.log('Users data received:', data?.users?.length || 0, 'users');
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Fetch users error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

const fetchAllServices = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const headers = getAuthHeaders();
    console.log('Fetching services from:', `${API_BASE}/api/admin/services`);
    
    const res = await fetch(`${API_BASE}/api/admin/services`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    console.log('Services response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Services error response:', errorText);
      if (res.status === 403) throw new Error('Admin access required');
      if (res.status === 401) throw new Error('Authentication required');
      throw new Error(`Failed to load services: ${res.status} - ${errorText.substring(0, 100)}`);
    }
    const data = await res.json();
    console.log('Services data received:', data?.services?.length || 0, 'services');
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Fetch services error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

const fetchAllBookings = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/bookings`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      if (res.status === 403) throw new Error('Admin access required');
      if (res.status === 401) throw new Error('Authentication required');
      throw new Error(`Failed to load bookings: ${res.status}`);
    }
    return res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

const fetchAnalytics = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/analytics`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      if (res.status === 403) throw new Error('Admin access required');
      if (res.status === 401) throw new Error('Authentication required');
      throw new Error(`Failed to load analytics: ${res.status}`);
    }
    return res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token] = useState(() => localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'bookings'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [editUserData, setEditUserData] = useState<any>({});
  const [editServiceData, setEditServiceData] = useState<any>({});

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
    }
  }, [token, navigate]);

  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: fetchAllUsers,
    enabled: !!token,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5000,
    onError: (error) => {
      console.error('Error fetching users:', error);
    },
    onSuccess: (data) => {
      console.log('Users fetched:', data?.users?.length || 0, 'users');
    },
  });

  const { data: servicesData, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useQuery({
    queryKey: ['admin-all-services'],
    queryFn: fetchAllServices,
    enabled: !!token,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5000,
    onError: (error) => {
      console.error('Error fetching services:', error);
    },
    onSuccess: (data) => {
      console.log('Services fetched:', data?.services?.length || 0, 'services');
    },
  });

  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: fetchAllBookings,
    enabled: !!token,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5000,
    onError: (error) => {
      console.error('Error fetching bookings:', error);
    },
    onSuccess: (data) => {
      console.log('Bookings fetched:', data?.bookings?.length || 0, 'bookings');
    },
  });

  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: fetchAnalytics,
    enabled: !!token,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5000,
    onError: (error) => {
      console.error('Error fetching analytics:', error);
    },
    onSuccess: (data) => {
      console.log('Analytics fetched:', data);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ email, data }: { email: string; data: any }) => {
      const res = await fetch(`${API_BASE}/api/admin/users/${email}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      setEditingUser(null);
      setEditUserData({});
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`${API_BASE}/api/admin/users/${email}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`${API_BASE}/api/admin/services/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update service');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-services'] });
      setEditingService(null);
      setEditServiceData({});
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete service');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-services'] });
    },
  });

  // Ensure we're getting the data correctly
  const allUsers = Array.isArray(usersData?.users) ? usersData.users : (Array.isArray(usersData) ? usersData : []);
  const allServices = Array.isArray(servicesData?.services) ? servicesData.services : (Array.isArray(servicesData) ? servicesData : []);
  const allBookings = Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : (Array.isArray(bookingsData) ? bookingsData : []);
  
  // Debug logging
  useEffect(() => {
    if (usersData) {
      console.log('Users data structure:', usersData);
      console.log('All users count:', allUsers.length);
    }
    if (servicesData) {
      console.log('Services data structure:', servicesData);
      console.log('All services count:', allServices.length);
    }
    if (bookingsData) {
      console.log('Bookings data structure:', bookingsData);
      console.log('All bookings count:', allBookings.length);
    }
  }, [usersData, servicesData, bookingsData, allUsers.length, allServices.length, allBookings.length]);

  const filteredUsers = allUsers.filter((user: any) =>
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.username?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredServices = allServices.filter((service: any) =>
    service.name?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    service.provider?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    service.category?.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const stats = [
    {
      label: "Total Users",
      value: analytics?.totalUsers || allUsers.length,
      change: `${allUsers.filter((u: any) => u.role === 'provider').length} providers`,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Providers",
      value: analytics?.activeProviders || allUsers.filter((u: any) => u.role === 'provider').length,
      change: "Currently active",
      icon: Briefcase,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Active Influencers",
      value: analytics?.activeInfluencers || allUsers.filter((u: any) => u.role === 'influencer').length,
      change: "Currently active",
      icon: TrendingUp,
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-500/10",
    },
    {
      label: "Total Services",
      value: analytics?.totalServices || allServices.length,
      change: `${analytics?.activeServices || allServices.filter((s: any) => s.status === 'Active').length} active`,
      icon: FileText,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Bookings",
      value: analytics?.totalBookings || allBookings.length,
      change: `${allBookings.filter((b: any) => b.status === 'confirmed').length} confirmed`,
      icon: CalendarDays,
      color: "from-orange-500 to-amber-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Website Views",
      value: analytics?.viewCount?.toLocaleString() || '0',
      change: analytics?.views24h ? `${analytics.views24h} today` : "Loading...",
      icon: Eye,
      color: "from-indigo-500 to-purple-500",
      bg: "bg-indigo-500/10",
    },
  ];

  const handleEditUser = (user: any) => {
    setEditingUser(user.email);
    setEditUserData({
      name: user.name || '',
      username: user.username || '',
      role: user.role || '',
      bio: user.bio || '',
      location: user.location || '',
    });
  };

  const handleEditService = (service: any) => {
    setEditingService(service.id);
    setEditServiceData({
      name: service.name || '',
      price: service.price || '',
      status: service.status || 'Active',
      category: service.category || '',
      location: service.location || '',
    });
  };

  if (!token) {
    return null;
  }

  // Check if user is admin
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  // Verify user role from backend
  useEffect(() => {
    const checkUserRole = async () => {
      if (!token) {
        setCheckingRole(false);
        return;
      }
      
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role || null);
          console.log('User role from backend:', data.role);
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      } finally {
        setCheckingRole(false);
      }
    };
    
    checkUserRole();
  }, [token]);

  const isAdmin = userRole === 'admin' || user?.role === 'admin';

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-[#030711] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white/60">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && user) {
    return (
      <div className="min-h-screen bg-[#030711] text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-white/60 mb-4">
            Admin access required to view this page.
            {userRole && (
              <span className="block mt-2 text-sm">
                Your current role: <span className="text-cyan-300">{userRole}</span>
              </span>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600"
            >
              Go to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error messages inline instead of blocking the page
  const showError = usersError || servicesError;

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute left-1/2 bottom-0 h-64 w-64 rounded-full bg-pink-500/15 blur-[100px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/50 mb-2">
              <Shield className="h-4 w-4" />
              admin control panel
            </div>
            <h1 className="text-3xl md:text-4xl font-black">Admin Dashboard</h1>
            <p className="mt-2 text-white/60">Monitor and manage the OneFame platform</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Site
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          {(['overview', 'users', 'services', 'bookings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? 'border-b-2 border-cyan-400 text-cyan-300'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Grid - Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                          <Icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: "currentColor" }} />
                        </div>
                        <span className="text-xs font-medium text-white/50">{stat.change}</span>
                      </div>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-white/60">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-blue-500/20 p-2">
                    <UserPlus className="h-5 w-5 text-blue-300" />
                  </div>
                  <h2 className="text-xl font-bold">Recent Users</h2>
                </div>
                {usersLoading ? (
                  <p className="text-sm text-white/50 text-center py-4">Loading...</p>
                ) : (
                  <div className="space-y-2">
                    {allUsers.slice(0, 5).map((user: any, idx: number) => (
                      <div key={user.email || idx} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{user.name || 'Unknown'}</p>
                            <p className="text-xs text-white/50">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'provider' ? 'bg-purple-500/20 text-purple-300' :
                          user.role === 'influencer' ? 'bg-pink-500/20 text-pink-300' :
                          user.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300' :
                          'bg-white/10 text-white/70'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-green-500/20 p-2">
                    <Briefcase className="h-5 w-5 text-green-300" />
                  </div>
                  <h2 className="text-xl font-bold">Recent Services</h2>
                </div>
                {servicesLoading ? (
                  <p className="text-sm text-white/50 text-center py-4">Loading...</p>
                ) : (
                  <div className="space-y-2">
                    {allServices.slice(0, 5).map((service: any, idx: number) => (
                      <div key={service.id || idx} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                        <div>
                          <p className="text-sm font-semibold text-white">{service.name}</p>
                          <p className="text-xs text-white/50">{service.provider}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-cyan-300">₹{service.price}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            service.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                            'bg-white/10 text-white/70'
                          }`}>
                            {service.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/20 p-2">
                  <Users className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">All Users ({allUsers.length})</h2>
                  <p className="text-sm text-white/50">Manage platform users</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  onClick={() => refetchUsers()}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-300 transition"
                  title="Refresh users"
                >
                  <Activity className="h-4 w-4" />
                </button>
              </div>
            </div>
            {usersError && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-red-300">Error loading users</p>
                    <p className="text-xs text-red-400/70">{usersError.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => refetchUsers()}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm"
                >
                  Retry
                </button>
              </div>
            )}
            </div>
            {usersLoading ? (
              <div className="text-center py-12">
                <p className="text-white/60">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user: any) => (
                  <div
                    key={user.email}
                    className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/40 hover:bg-white/10"
                  >
                    {editingUser === user.email ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editUserData.name}
                            onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                            placeholder="Name"
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                          />
                          <input
                            type="text"
                            value={editUserData.username}
                            onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                            placeholder="Username"
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                          />
                          <select
                            value={editUserData.role}
                            onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400"
                          >
                            <option value="user">User</option>
                            <option value="provider">Provider</option>
                            <option value="influencer">Influencer</option>
                            <option value="admin">Admin</option>
                          </select>
                          <input
                            type="text"
                            value={editUserData.location}
                            onChange={(e) => setEditUserData({ ...editUserData, location: e.target.value })}
                            placeholder="Location"
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <textarea
                          value={editUserData.bio}
                          onChange={(e) => setEditUserData({ ...editUserData, bio: e.target.value })}
                          placeholder="Bio"
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateUserMutation.mutate({ email: user.email, data: editUserData })}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setEditUserData({});
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">{user.name || 'Unknown'}</h3>
                            <p className="text-sm text-white/60 truncate">{user.email}</p>
                            {user.username && <p className="text-xs text-white/50">@{user.username}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'provider' ? 'bg-purple-500/20 text-purple-300' :
                            user.role === 'influencer' ? 'bg-pink-500/20 text-pink-300' :
                            user.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300' :
                            'bg-white/10 text-white/70'
                          }`}>
                            {user.role || 'user'}
                          </span>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete user ${user.email}?`)) {
                                deleteUserMutation.mutate(user.email);
                              }
                            }}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-500/20 p-2">
                  <Briefcase className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">All Services ({allServices.length})</h2>
                  <p className="text-sm text-white/50">Manage platform services</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  onClick={() => refetchServices()}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-300 transition"
                  title="Refresh services"
                >
                  <Activity className="h-4 w-4" />
                </button>
              </div>
            </div>
            {servicesError && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-red-300">Error loading services</p>
                    <p className="text-xs text-red-400/70">{servicesError.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => refetchServices()}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm"
                >
                  Retry
                </button>
              </div>
            )}
            {servicesLoading ? (
              <div className="text-center py-12">
                <p className="text-white/60">Loading services...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((service: any) => (
                  <div
                    key={service.id}
                    className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/40 hover:bg-white/10"
                  >
                    {editingService === service.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editServiceData.name}
                            onChange={(e) => setEditServiceData({ ...editServiceData, name: e.target.value })}
                            placeholder="Service Name"
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                          />
                          <input
                            type="number"
                            value={editServiceData.price}
                            onChange={(e) => setEditServiceData({ ...editServiceData, price: e.target.value })}
                            placeholder="Price"
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                          />
                          <select
                            value={editServiceData.status}
                            onChange={(e) => setEditServiceData({ ...editServiceData, status: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <input
                            type="text"
                            value={editServiceData.category}
                            onChange={(e) => setEditServiceData({ ...editServiceData, category: e.target.value })}
                            placeholder="Category"
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                          />
                          <input
                            type="text"
                            value={editServiceData.location}
                            onChange={(e) => setEditServiceData({ ...editServiceData, location: e.target.value })}
                            placeholder="Location"
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateServiceMutation.mutate({ id: service.id, data: editServiceData })}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingService(null);
                              setEditServiceData({});
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1">{service.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-white/60">
                            <span>{service.provider}</span>
                            <span>•</span>
                            <span>{service.category || 'General'}</span>
                            {service.location && (
                              <>
                                <span>•</span>
                                <span>{service.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-cyan-300">₹{service.price}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              service.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                              'bg-white/10 text-white/70'
                            }`}>
                              {service.status || 'Active'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleEditService(service)}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete service ${service.name}?`)) {
                                deleteServiceMutation.mutate(service.id);
                              }
                            }}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-orange-500/20 p-2">
                <CalendarDays className="h-5 w-5 text-orange-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold">All Bookings ({allBookings.length})</h2>
                <p className="text-sm text-white/50">View all platform bookings</p>
              </div>
            </div>
            {bookingsLoading ? (
              <div className="text-center py-12">
                <p className="text-white/60">Loading bookings...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allBookings.map((booking: any, idx: number) => (
                  <div
                    key={booking.id || idx}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{booking.service || booking.name || 'Booking'}</p>
                        <div className="flex items-center gap-3 text-sm text-white/60 mt-1">
                          <span>Client: {booking.client}</span>
                          <span>•</span>
                          <span>Provider: {booking.provider}</span>
                          {booking.date && (
                            <>
                              <span>•</span>
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        booking.status === 'completed' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-white/10 text-white/70'
                      }`}>
                        {booking.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
