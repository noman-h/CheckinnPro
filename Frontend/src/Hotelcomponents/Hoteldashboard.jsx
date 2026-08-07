import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Building2, 
  CalendarCheck, 
  DollarSign, 
  Star, 
  CheckCircle2, 
  XCircle, 
  PieChart as PieIcon
} from 'lucide-react';

function Hoteldashboard() {
  const hotelemail = localStorage.getItem("email");

  const [bookingdata, setbookingdata] = useState([]);
  const [roomdata, setroomdata] = useState([]);
  const [reviewdata, setreviewdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [darkMode] = useState(false);

  const fetchrooms = useCallback(async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/room/getallhotelrooms/${hotelemail}?search&&status=active`
      );
      setroomdata(result?.data?.response || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  }, [hotelemail]);

  console.log(roomdata);
  

  const fetchbooking = useCallback(async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/hotelbooking/${hotelemail}`
      );
      setbookingdata(result?.data?.response || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [hotelemail]);

  const fetchreviews = useCallback(async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/review/hotelreviews/${hotelemail}`
      );
      setreviewdata(result?.data?.result || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, [hotelemail]);

  useEffect(() => {
    async function loadData() {
      if (!hotelemail) {
        setLoading(false);
        return;
      }
      setLoading(true);
      await Promise.all([fetchrooms(), fetchbooking(), fetchreviews()]);
      setLoading(false);
    }
    loadData();
  }, [hotelemail, fetchrooms, fetchbooking, fetchreviews]);

  // Analytics & Availability Computations
  const metrics = useMemo(() => {
    const completedBookings = bookingdata.filter(b => b.bookingstatus === 'completed');
    const cancelledBookings = bookingdata.filter(b => b.bookingstatus === 'cancelled');
    
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const avgRating = reviewdata.length > 0
      ? (reviewdata.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewdata.length).toFixed(1)
      : 'N/A';

    const hotelInfo = roomdata[0]?.hotel_id || {};

    // Calculate Occupied / Available Rooms dynamically
    const occupiedRoomIds = new Set(
      bookingdata
        .filter(b => b.bookingstatus === 'active')
        .map(b => b.room?._id || b.room)
    );

    const totalRooms = roomdata.length;
    const occupiedCount = occupiedRoomIds.size;
    const availableCount = Math.max(0, totalRooms - occupiedCount);

    return {
      totalRevenue,
      totalBookings: bookingdata.length,
      completedCount: completedBookings.length,
      cancelledCount: cancelledBookings.length,
      totalRooms,
      occupiedCount,
      availableCount,
      avgRating,
      hotelName: hotelInfo.hotelName || "Hotel Dashboard",
      hotelAddress: hotelInfo.Address || ""
    };
  }, [bookingdata, roomdata, reviewdata]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookingdata;
    return bookingdata.filter(b => b.bookingstatus === bookingFilter);
  }, [bookingdata, bookingFilter]);

  // SVG Pie Chart Helper Calculation
  const pieChartData = useMemo(() => {
    const total = metrics.totalRooms || 1;
    const occupiedPct = (metrics.occupiedCount / total) * 100;
    const availablePct = (metrics.availableCount / total) * 100;
    
    const circumference = 2 * Math.PI * 40;
    const occupiedStroke = (occupiedPct / 100) * circumference;

    return {
      circumference,
      occupiedStroke,
      occupiedPct: Math.round(occupiedPct),
      availablePct: Math.round(availablePct)
    };
  }, [metrics]);

  if (loading) {
    return (
      <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="flex py-20 items-center justify-center transition-colors">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading Hotel Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="font-sans text-slate-800 transition-colors duration-200 dark:text-slate-100">
        
        {/* Top Header */}
        <header className="mx-auto mb-8 flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white capitalize">{metrics.hotelName}</h1>
              {metrics.hotelAddress && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{metrics.hotelAddress}</p>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Dashboard */}
        <main className="mx-auto max-w-7xl space-y-8">

          {/* 1. Key Metrics & Pie Chart Section */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Total Revenue */}
            <div className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm transition-colors dark:border-indigo-900/50 dark:bg-indigo-950/20">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Revenue</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹{metrics.totalRevenue.toLocaleString()}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">From completed bookings</p>
              </div>
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Total Bookings */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Bookings</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{metrics.totalBookings}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{metrics.completedCount} completed</span> · <span className="text-rose-500 dark:text-rose-400">{metrics.cancelledCount} cancelled</span>
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                <CalendarCheck className="w-6 h-6" />
              </div>
            </div>

            {/* Room Availability Pie Chart Card */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <PieIcon className="w-3.5 h-3.5 text-indigo-500" /> Room Status
                </p>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-slate-600 dark:text-slate-300">Available: <strong>{metrics.availableCount}</strong> ({pieChartData.availablePct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                    <span className="text-slate-600 dark:text-slate-300">Occupied: <strong>{metrics.occupiedCount}</strong> ({pieChartData.occupiedPct}%)</span>
                  </div>
                </div>
              </div>

              {/* SVG Donut/Pie Chart Visual */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-emerald-400 dark:stroke-emerald-500 fill-none"
                    strokeWidth="16"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-indigo-600 dark:stroke-indigo-500 fill-none transition-all duration-500"
                    strokeWidth="16"
                    strokeDasharray={`${pieChartData.occupiedStroke} ${pieChartData.circumference}`}
                  />
                </svg>
                <div className="absolute text-[11px] font-bold text-slate-800 dark:text-white">
                  {metrics.totalRooms} Rooms
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Average Rating</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-1">
                  {metrics.avgRating} <span className="text-amber-400 text-lg">★</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{reviewdata.length} total reviews</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 2. Booking Records Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Booking Records</h2>
              <div className="flex gap-2">
                {['all', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setBookingFilter(status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                      bookingFilter === status 
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Guest Details</th>
                    <th className="px-4 py-3">Room Info</th>
                    <th className="px-4 py-3">Check-In</th>
                    <th className="px-4 py-3">Check-Out</th>
                    <th className="px-4 py-3">Total Price</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400 dark:text-slate-500">
                        No matching booking records found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b, idx) => (
                      <tr key={b._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{b.user?.name || "Guest"}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">{b.user?.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">Room {b.room?.roomno || 'N/A'}</span> ({b.room?.roomtype})
                        </td>
                        <td className="px-4 py-3">{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-3">{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">₹{b.totalPrice}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            b.bookingstatus === 'completed' 
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}>
                            {b.bookingstatus === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {b.bookingstatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Customer Reviews Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Customer Reviews
            </h2>
            
            {reviewdata.length === 0 ? (
              <p className="text-center py-8 text-slate-400 dark:text-slate-500">No review records found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewdata.map((rev, idx) => (
                  <div key={rev._id || idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {"★".repeat(rev.rating || 0)}{"☆".repeat(5 - (rev.rating || 0))}
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">({rev.rating}/5)</span>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                      {rev.reviewtext || <span className="text-slate-400 dark:text-slate-500 italic">No feedback written.</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default Hoteldashboard;