import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats] = useState([
    { 
      label: "Active Bookings", 
      value: "3", 
      icon: Calendar,
      trend: "+2 this month",
      color: "text-primary"
    },
    { 
      label: "Unread Messages", 
      value: "7", 
      icon: MessageSquare,
      trend: "3 new today",
      color: "text-accent"
    },
    { 
      label: "Total Spent", 
      value: "$2,450", 
      icon: DollarSign,
      trend: "+12% from last month",
      color: "text-green-500"
    },
    { 
      label: "Profile Views", 
      value: "156", 
      icon: TrendingUp,
      trend: "+23 this week",
      color: "text-blue-500"
    }
  ]);

  const upcomingBookings = [
    {
      id: 1,
      service: "Photography Session",
      provider: "Alex Photography",
      date: "Mar 25, 2024",
      time: "2:00 PM",
      status: "confirmed",
      price: "$150"
    },
    {
      id: 2,
      service: "Video Editing",
      provider: "Edit Masters",
      date: "Mar 28, 2024",
      time: "10:00 AM",
      status: "pending",
      price: "$200"
    }
  ];

  const recentMessages = [
    {
      id: 1,
      sender: "Alex Photography",
      message: "Looking forward to our session tomorrow!",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 2,
      sender: "Creative Videos Co.",
      message: "I've sent over the project proposal",
      time: "1 day ago",
      unread: false
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/Login');
      return;
    }
    fetch('http://localhost:4000/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        else navigate('/auth/Login');
      });
  }, [navigate]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-pink-700 mb-6 text-center">Welcome, {user.name}!</h1>
        <div className="mb-6 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-pink-100 text-pink-700 font-semibold shadow">Role: {user.role}</span>
        </div>
        <div className="space-y-4">
          <div><strong>Email:</strong> {user.email}</div>
          {user.bio && <div><strong>Bio:</strong> {user.bio}</div>}
          {user.interests && <div><strong>Interests:</strong> {user.interests}</div>}
          {user.skills && <div><strong>Skills:</strong> {user.skills}</div>}
          {user.location && <div><strong>Location:</strong> {user.location}</div>}
          {user.experience && <div><strong>Experience:</strong> {user.experience}</div>}
          {user.socials && <div><strong>Socials:</strong> {user.socials}</div>}
          {user.services && <div><strong>Services:</strong> {user.services}</div>}
        </div>
        <div className="mt-8 flex justify-center">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/auth/Login'); }} className="px-6 py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-400 text-white font-bold shadow hover:from-pink-600 hover:to-purple-500 transition">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
