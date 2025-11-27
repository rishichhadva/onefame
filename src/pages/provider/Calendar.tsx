import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, CalendarDays, Clock, User, Briefcase, DollarSign, ExternalLink, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { apiUrl } from '@/lib/api';

const ProviderCalendar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedBookings, setSelectedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(apiUrl("/api/bookings"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        // Filter bookings where this user is the provider
        const providerBookings = Array.isArray(data)
          ? data.filter((b: any) =>
              b.provider?.toLowerCase() === user?.name?.toLowerCase() ||
              b.provider?.toLowerCase() === user?.email?.toLowerCase()
            )
          : [];
        setBookings(providerBookings);
      } catch (err) {
        console.error(err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  // Get bookings for selected date
  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayBookings = bookings.filter((b: any) => {
        if (!b.date) return false;
        const bookingDate = new Date(b.date);
        return format(bookingDate, 'yyyy-MM-dd') === dateStr;
      });
      setSelectedBookings(dayBookings);
    } else {
      setSelectedBookings([]);
    }
  }, [selectedDate, bookings]);

  // Get dates with bookings for calendar highlighting
  const getDatesWithBookings = () => {
    return bookings
      .filter((b: any) => b.date)
      .map((b: any) => {
        const date = new Date(b.date);
        date.setHours(0, 0, 0, 0);
        return date;
      });
  };

  const datesWithBookings = getDatesWithBookings();

  // Custom day renderer to highlight days with bookings
  const modifiers = {
    hasBooking: (date: Date) => {
      return datesWithBookings.some(
        (bookingDate) =>
          bookingDate.getTime() === date.getTime()
      );
    },
  };

  const modifiersClassNames = {
    hasBooking: 'bg-purple-500/20 border-purple-400/40 border-2',
  };

  const handleGoogleCalendarConnect = () => {
    // TODO: Implement Google Calendar OAuth
    // For now, show a message
    alert('Google Calendar integration coming soon! This will sync your bookings with your Google Calendar.');
    setGoogleConnected(true);
  };

  const handleMicrosoftCalendarConnect = () => {
    // TODO: Implement Microsoft Calendar OAuth
    // For now, show a message
    alert('Microsoft Calendar integration coming soon! This will sync your bookings with your Outlook Calendar.');
    setMicrosoftConnected(true);
  };

  const exportToGoogleCalendar = () => {
    if (bookings.length === 0) {
      alert('No bookings to export');
      return;
    }
    
    // Generate Google Calendar URL
    const events = bookings.map((b: any) => {
      const startDate = b.date ? new Date(b.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
      const endDate = b.date ? new Date(new Date(b.date).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
      const title = encodeURIComponent(`${b.service || 'Service'} - ${b.client || 'Client'}`);
      const details = encodeURIComponent(`Client: ${b.client || 'N/A'}\nService: ${b.service || 'N/A'}\nStatus: ${b.status || 'Pending'}`);
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
    });
    
    // Open first event (or combine them)
    if (events[0]) {
      window.open(events[0], '_blank');
    }
  };

  const exportToMicrosoftCalendar = () => {
    if (bookings.length === 0) {
      alert('No bookings to export');
      return;
    }
    
    // Generate Microsoft Calendar URL
    const event = bookings[0]; // Export first booking as example
    if (event.date) {
      const startDate = new Date(event.date).toISOString();
      const endDate = new Date(new Date(event.date).getTime() + 60 * 60 * 1000).toISOString();
      const subject = encodeURIComponent(`${event.service || 'Service'} - ${event.client || 'Client'}`);
      const body = encodeURIComponent(`Client: ${event.client || 'N/A'}\nService: ${event.service || 'N/A'}\nStatus: ${event.status || 'Pending'}`);
      const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${startDate}&enddt=${endDate}&body=${body}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030711] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/provider/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all border border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-black text-white">My Calendar</h1>
              <p className="text-white/60 mt-1">View and manage your bookings</p>
            </div>
          </div>
        </div>

        {/* Calendar Integration Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/20 p-2">
                <Link2 className="h-5 w-5 text-purple-300" />
              </div>
              <h2 className="text-xl font-bold text-white">Calendar Integration</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-300 font-bold text-sm">G</span>
                  </div>
                  <span className="font-semibold text-white">Google Calendar</span>
                </div>
                {googleConnected ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">Connected</span>
                ) : (
                  <button
                    onClick={handleGoogleCalendarConnect}
                    className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition"
                  >
                    Connect
                  </button>
                )}
              </div>
              <button
                onClick={exportToGoogleCalendar}
                className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-white/80"
              >
                Export to Google Calendar
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center">
                    <span className="text-blue-300 font-bold text-sm">M</span>
                  </div>
                  <span className="font-semibold text-white">Microsoft Calendar</span>
                </div>
                {microsoftConnected ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">Connected</span>
                ) : (
                  <button
                    onClick={handleMicrosoftCalendarConnect}
                    className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition"
                  >
                    Connect
                  </button>
                )}
              </div>
              <button
                onClick={exportToMicrosoftCalendar}
                className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-white/80"
              >
                Export to Outlook
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-white mb-4">Select a Date</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-xl"
            />
            <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
              <div className="w-4 h-4 rounded border-2 border-purple-400/40 bg-purple-500/20"></div>
              <span>Days with bookings</span>
            </div>
          </div>

          {/* Bookings for Selected Date */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-white mb-4">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
            </h2>
            {selectedBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">No bookings on this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedBookings.map((booking: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-purple-400/40 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-white/60" />
                          <span className="font-semibold text-white">{booking.client || 'Client'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{booking.service || booking.offering || 'Service'}</span>
                        </div>
                        {booking.date && (
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(booking.date), 'h:mm a')}</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'Confirmed'
                          ? 'bg-green-500/20 text-green-300'
                          : booking.status === 'Pending'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {booking.status || 'Pending'}
                      </span>
                    </div>
                    {booking.price && (
                      <div className="flex items-center gap-2 text-sm text-cyan-300 mt-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">{booking.price}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Bookings Summary */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-bold text-white mb-4">All Bookings ({bookings.length})</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.slice(0, 10).map((booking: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-white/60 w-24">
                      {booking.date ? format(new Date(booking.date), 'MMM d') : 'TBD'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{booking.client || 'Client'}</div>
                      <div className="text-sm text-white/60">{booking.service || booking.offering || 'Service'}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'Confirmed'
                      ? 'bg-green-500/20 text-green-300'
                      : booking.status === 'Pending'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
              ))}
              {bookings.length > 10 && (
                <p className="text-center text-sm text-white/60 mt-4">
                  Showing 10 of {bookings.length} bookings
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderCalendar;

