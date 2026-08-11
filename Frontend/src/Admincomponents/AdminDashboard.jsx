import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  IndianRupee, 
  Building2, 
  Bookmark, 
  Star, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  XCircle,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BOOKINGS_PER_PAGE = 8;
const REVIEWS_PER_PAGE = 6;

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange, label = '' }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta + 1;
  let lastPage;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      pages.push(i);
    }
  }

  const renderedPages = [];
  for (let i = 0; i < pages.length; i++) {
    if (lastPage && pages[i] - lastPage > 1) renderedPages.push('...');
    renderedPages.push(pages[i]);
    lastPage = pages[i];
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {label && <>{label} · </>}Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {renderedPages.map((page, idx) =>
          page === '...' ? (
            <span key={`e-${idx}`} className="px-2 text-xs text-slate-400 dark:text-slate-500">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-7 h-7 px-1.5 rounded-md text-xs font-medium transition-colors ${
                currentPage === page
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AdminDashboard() {
   const navigate=useNavigate()
  const adminemail = localStorage.getItem('email');

  const [hoteldata, sethoteldata] = useState([]);
  const [roomdata, setroomdata] = useState([]);
  const [bookingdata, setbookingdata] = useState([]);
  const [reviewsdata, setreviewsdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [bookingPage, setBookingPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  const token=localStorage.getItem('token')

  async function fetchhotels() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/hotel/getalladminhotels/${adminemail}?search&&sort&&status=active`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      sethoteldata(result?.data?.response || []);
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.log('Error fetching hotels:', err.response || err);
    }
  }

  async function fetchrooms() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/room/getalladminhotelrooms/${adminemail}?search&&status=active&&sort`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const responseData = result?.data?.response;
      setroomdata(Array.isArray(responseData) ? responseData : []);
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.log('Error fetching rooms:', err);
    }
  }

  

  async function fetchbooking() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/alladminbooking/${adminemail}?search&&sort`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setbookingdata(result?.data?.response || []);
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.log('Error fetching bookings:', err);
    }
  }

  async function fetchreviews() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/review/adminhotelreviews/${adminemail}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setreviewsdata(result?.data?.result || []);
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.log('Error fetching reviews:', err);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchbooking(),
        fetchhotels(),
        fetchrooms(),
        fetchreviews(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // --- DERIVED METRICS ---

  // 1. Total Cumulative Revenue
  const totalRevenue = useMemo(() => {
    return bookingdata.reduce((sum, item) => {
      if (item?.bookingstatus === 'cancelled') return sum;
      const amount = item?.totalPrice || item?.totalAmount || item?.price || 0;
      return sum + Number(amount);
    }, 0);
  }, [bookingdata]);

  // 2. Revenue Graph Monthly Aggregation Data
  const revenueChartData = useMemo(() => {
    const monthMap = {};

    const validBookings = bookingdata.filter(
      (b) => b?.bookingstatus !== 'cancelled' && b?.createdAt
    );

    validBookings.forEach((b) => {
      const date = new Date(b.createdAt);
      if (isNaN(date.getTime())) return;

      const monthKey = date.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      const amount = Number(b?.totalPrice || b?.totalAmount || b?.price || 0);

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          dateObj: date,
          label: monthKey,
          revenue: 0,
          count: 0
        };
      }
      monthMap[monthKey].revenue += amount;
      monthMap[monthKey].count += 1;
    });

    const sorted = Object.values(monthMap).sort((a, b) => a.dateObj - b.dateObj);

    if (sorted.length === 0) {
      return [
        { label: 'Jan', revenue: 0, count: 0 },
        { label: 'Feb', revenue: 0, count: 0 },
        { label: 'Mar', revenue: 0, count: 0 }
      ];
    }

    return sorted;
  }, [bookingdata]);

  // Chart SVG points calculation
  const chartCoordinates = useMemo(() => {
    if (revenueChartData.length === 0) return { path: '', area: '', points: [] };

    const width = 800;
    const height = 240;
    const padding = 30;

    const maxRevenue = Math.max(...revenueChartData.map((d) => d.revenue), 100);
    const minRevenue = 0;

    const points = revenueChartData.map((item, index) => {
      const divisor = revenueChartData.length > 1 ? revenueChartData.length - 1 : 1;
      const x = padding + (index / divisor) * (width - padding * 2);
      const y = height - padding - ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * (height - padding * 2);
      return { x, y, label: item.label, revenue: item.revenue, count: item.count };
    });

    if (points.length === 1) {
      const p = points[0];
      return {
        path: `M ${padding} ${p.y} L ${width - padding} ${p.y}`,
        area: `M ${padding} ${p.y} L ${width - padding} ${p.y} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`,
        points
      };
    }

    const path = points.reduce((acc, point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, '');

    const area = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { path, area, points };
  }, [revenueChartData]);

  // 3. Individual Hotel Revenue Breakdown
  const hotelRevenueBreakdown = useMemo(() => {
    const map = {};

    hoteldata.forEach((hotel) => {
      map[hotel._id] = {
        id: hotel._id,
        name: hotel.hotelName || 'Unnamed Property',
        revenue: 0,
        bookings: 0,
        approvalStatus: hotel.approveStatus || 'pending',
      };
    });

    bookingdata.forEach((b) => {
      if (b?.bookingstatus === 'cancelled') return;

      const hotelId = b?.hotels?._id || b?.hotelId?._id || b?.hotelId;
      const amount = b?.totalPrice || b?.totalAmount || b?.price || 0;

      if (map[hotelId]) {
        map[hotelId].revenue += Number(amount);
        map[hotelId].bookings += 1;
      }
    });

    return Object.values(map);
  }, [hoteldata, bookingdata]);

  // 4. UPDATED: Room Availability Metrics Calculated via Active Bookings
  const roomMetrics = useMemo(() => {
    const totalRooms = roomdata.length;
    const now = new Date();

    // Set active status based on current active reservations
    const occupiedRoomIds = new Set();

    bookingdata.forEach((booking) => {
      // Ignore cancelled bookings
      if (booking?.bookingstatus === 'cancelled') return;

      const checkIn = new Date(booking?.checkInDate || booking?.checkIn || booking?.fromDate);
      const checkOut = new Date(booking?.checkOutDate || booking?.checkOut || booking?.toDate);

      const isActiveBooking =
        (booking?.bookingstatus === 'active') &&
        (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && now >= checkIn && now <= checkOut);

      if (isActiveBooking) {
        // Extract room ID from booking references
        const roomId =booking?.roomId

        if (roomId) {
          occupiedRoomIds.add(roomId.toString());
        }
      }
    });

    const occupiedRooms = roomdata.filter((room) =>
      occupiedRoomIds.has(room._id?.toString()) || room.isavailable === false
    ).length;

    const availableRooms = Math.max(0, totalRooms - occupiedRooms);
    const occupancyPercentage =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return { totalRooms, availableRooms, occupiedRooms, occupancyPercentage };
  }, [roomdata, bookingdata]);

  // 5. Average Guest Rating
  const avgRating = useMemo(() => {
    if (!reviewsdata.length) return 'N/A';
    const sum = reviewsdata.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
    return (sum / reviewsdata.length).toFixed(1);
  }, [reviewsdata]);

  // 6. Paginated bookings
  const bookingTotalPages = Math.ceil(bookingdata.length / BOOKINGS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const start = (bookingPage - 1) * BOOKINGS_PER_PAGE;
    return bookingdata.slice(start, start + BOOKINGS_PER_PAGE);
  }, [bookingdata, bookingPage]);

  // 7. Paginated reviews
  const reviewTotalPages = Math.ceil(reviewsdata.length / REVIEWS_PER_PAGE);
  const paginatedReviews = useMemo(() => {
    const start = (reviewPage - 1) * REVIEWS_PER_PAGE;
    return reviewsdata.slice(start, start + REVIEWS_PER_PAGE);
  }, [reviewsdata, reviewPage]);

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/download/pdf`,
        { pdfdata : bookingdata },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookings.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
        <p className="text-sm font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Property performance and revenue metrics for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{adminemail}</span>
          </p>
        </div>
      </div>

      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Managed Hotels</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{hoteldata.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{bookingdata.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-xl">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Guest Rating</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgRating} / 5</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 rounded-xl">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Revenue Graph */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Revenue Growth Trend</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly total cumulative revenue progression</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 self-start sm:self-auto">
            Total Revenue: <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          <svg viewBox="0 0 800 240" className="w-full h-56 sm:h-64 overflow-visible">
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {[40, 90, 140, 190].map((y, index) => (
              <line
                key={index}
                x1="30"
                y1={y}
                x2="770"
                y2={y}
                className="stroke-slate-100 dark:stroke-slate-800/60"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {chartCoordinates.area && (
              <path d={chartCoordinates.area} fill="url(#revenueGradient)" />
            )}

            {chartCoordinates.path && (
              <path
                d={chartCoordinates.path}
                fill="none"
                className="stroke-indigo-600 dark:stroke-indigo-400"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {chartCoordinates.points.map((point, index) => (
              <g key={index} className="cursor-pointer">
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint?.label === point.label ? "7" : "5"}
                  className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900 transition-all duration-150"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <text
                  x={point.x}
                  y="225"
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 text-[11px] font-medium"
                >
                  {point.label}
                </text>
              </g>
            ))}
          </svg>

          {hoveredPoint && (
            <div
              className="absolute z-10 pointer-events-none bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-2.5 rounded-lg shadow-xl text-xs transition-opacity duration-150 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(hoveredPoint.x / 800) * 100}%`,
                top: `${(hoveredPoint.y / 240) * 100 - 4}%`,
              }}
            >
              <p className="font-semibold">{hoveredPoint.label}</p>
              <p className="text-emerald-400 dark:text-emerald-600 font-bold mt-0.5">
                ₹{hoveredPoint.revenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-300 dark:text-slate-500">
                {hoveredPoint.count} bookings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Middle Section: Room Availability & Per-Hotel Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Room Availability Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Room Availability</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Real-time status calculated from live bookings</p>

            <div className="mb-6">
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-slate-600 dark:text-slate-300">Occupancy Rate</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{roomMetrics.occupancyPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${roomMetrics.occupancyPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Available
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{roomMetrics.availableRooms}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium mb-1">
                  <Clock className="w-4 h-4" /> Occupied
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{roomMetrics.occupiedRooms}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Total Registered Rooms</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{roomMetrics.totalRooms}</span>
          </div>
        </div>

        {/* Per-Hotel Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Hotel Revenue Breakdown</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Revenue and bookings per individual hotel property</p>

          <div className="space-y-4 max-h-65 overflow-y-auto pr-2">
            {hotelRevenueBreakdown.length > 0 ? (
              hotelRevenueBreakdown.map((hotel) => {
                const maxRevenue = Math.max(...hotelRevenueBreakdown.map((h) => h.revenue), 1);
                const percent = Math.round((hotel.revenue / maxRevenue) * 100);

                return (
                  <div key={hotel.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{hotel.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{hotel.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap min-w-17.5 text-right">
                        {hotel.bookings} bookings
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center">No hotel data recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table: Bookings with Pagination */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Booking Records</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">All reservation logs from your administrative properties</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPDF} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2">
              <Download className="h-4 w-4" /> PDF
            </button>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full font-medium">
              {bookingdata.length} total
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Booking ID</th>
                <th className="px-5 py-3">Hotel Name</th>
                <th className="px-5 py-3">Guest</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((booking, idx) => {
                  const rowNum = (bookingPage - 1) * BOOKINGS_PER_PAGE + idx + 1;
                  return (
                    <tr key={booking._id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 text-xs font-medium">{rowNum}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {booking._id ? `${booking._id.substring(0, 8)}…` : `#${rowNum}`}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                        {booking.hotels?.hotelName || booking.hotelName || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {(booking.user?.name || 'G').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-slate-700 dark:text-slate-300">{booking.user?.name || 'Guest'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                        ₹{(booking.totalPrice || booking.totalAmount || booking.price || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          booking.bookingstatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                            : booking.bookingstatus === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                        }`}>
                          {booking.bookingstatus === 'cancelled'
                            ? <XCircle className="w-3 h-3" />
                            : <CheckCircle2 className="w-3 h-3" />}
                          {booking.bookingstatus || 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No booking records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={bookingPage}
          totalPages={bookingTotalPages}
          onPageChange={setBookingPage}
          label={`${bookingdata.length} bookings`}
        />
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" /> Customer Reviews
            </h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full font-medium">
              {reviewsdata.length} reviews
            </span>
          </div>
          {avgRating !== 'N/A' && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(parseFloat(avgRating))} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{avgRating}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">avg rating</span>
            </div>
          )}
        </div>

        {reviewsdata.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400 dark:text-slate-500">
            <Star className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-sm">No reviews yet</p>
            <p className="text-xs mt-1 opacity-70">Guest reviews will appear here after check-out</p>
          </div>
        ) : (
          <>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedReviews.map((rev, idx) => {
                const userName = rev.user?.name || rev.userId?.name || 'Guest';
                const userEmail = rev.user?.email || rev.userId?.email || '';
                const hotelName = rev.hotel?.hotelName || rev.hotelId?.hotelName || '';
                const initials = userName.charAt(0).toUpperCase();
                const colors = [
                  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
                  'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                  'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                ];
                const colorClass = colors[((reviewPage - 1) * REVIEWS_PER_PAGE + idx) % colors.length];

                return (
                  <div
                    key={rev._id || idx}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colorClass}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{userName}</p>
                          {userEmail && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight truncate max-w-32.5">{userEmail}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <StarRating rating={rev.rating || 0} />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{rev.rating}/5</span>
                    </div>

                    {hotelName && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mb-1.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {hotelName}
                      </p>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.reviewtext
                        ? `"${rev.reviewtext}"`
                        : <span className="text-slate-400 dark:text-slate-500 italic text-xs">No written feedback.</span>
                      }
                    </p>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={reviewPage}
              totalPages={reviewTotalPages}
              onPageChange={setReviewPage}
              label={`${reviewsdata.length} total`}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;