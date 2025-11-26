import UserProfile from "./pages/UserProfile";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import Messages from "./pages/Messages";
import ServiceProviderProfile from "./pages/ServiceProviderProfile";
import Booking from "./pages/Booking";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import AuthLogin from "./pages/auth/Login";
import PhoneLogin from "./pages/auth/PhoneLogin";
import AuthSignup from "./pages/auth/Signup";
import AuthForgotPassword from "./pages/auth/ForgotPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import InfluencerDashboard from "./pages/influencer/Dashboard";
import InfluencerProfile from "./pages/influencer/Profile";
import InfluencerCampaigns from "./pages/influencer/Campaigns";
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderProfile from "./pages/provider/Profile";
import ProviderCalendar from "./pages/provider/Calendar";
import BookingIndex from "./pages/booking/Index";
import ChatIndex from "./pages/chat/Index";
import PaymentsCheckout from "./pages/payments/Checkout";
import ReviewsIndex from "./pages/reviews/Index";
import CompleteProfile from "./pages/auth/CompleteProfile";
import CompleteProfileInfluencer from "./pages/auth/CompleteProfileInfluencer";
import CompleteProfileProvider from "./pages/auth/CompleteProfileProvider";
import SelectRole from "./pages/auth/SelectRole";
import ProvideServices from "./pages/provider/ProvideServices";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Help from "./pages/Help";
import PageViewTracker from "./components/PageViewTracker";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageViewTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<ServiceProviderProfile />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/auth/login" element={<AuthLogin />} />
            <Route path="/auth/phone" element={<PhoneLogin />} />
            <Route path="/auth/PhoneLogin" element={<PhoneLogin />} />
            <Route path="/auth/signup" element={<AuthSignup />} />
            <Route path="/auth/forgot-password" element={<AuthForgotPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/influencer/dashboard" element={<InfluencerDashboard />} />
            <Route path="/influencer/profile" element={<InfluencerProfile />} />
            <Route path="/influencer/campaigns" element={<InfluencerCampaigns />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route path="/provider/calendar" element={<ProviderCalendar />} />
            <Route path="/provider/ProvideServices" element={<ProvideServices />} />
            <Route path="/booking/index" element={<BookingIndex />} />
            <Route path="/chat/index" element={<ChatIndex />} />
            <Route path="/chat" element={<ChatIndex />} />
            <Route path="/payments/checkout" element={<PaymentsCheckout />} />
            <Route path="/reviews/index" element={<ReviewsIndex />} />
            <Route path="/auth/CompleteProfile" element={<CompleteProfile />} />
            <Route path="/auth/CompleteProfileInfluencer" element={<CompleteProfileInfluencer />} />
            <Route path="/auth/CompleteProfileProvider" element={<CompleteProfileProvider />} />
            <Route path="/auth/select-role" element={<SelectRole />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
