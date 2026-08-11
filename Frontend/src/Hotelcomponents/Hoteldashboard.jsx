import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Building2, 
  CalendarCheck, 
  DollarSign, 
  Star, 
  CheckCircle2, 
  XCircle, 
  PieChart as PieIcon,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BOOKINGS_PER_PAGE = 7;
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
    if (lastPage && pages[i] - lastPage > 1) {
      renderedPages.push('...');
    }
    renderedPages.push(pages[i]);
    lastPage = pages[i];
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
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
            <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 dark:text-slate-500">…</span>
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

function Hoteldashboard() {
  const hotelemail = localStorage.getItem("email");

  const [bookingdata, setbookingdata] = useState([]);
  const [roomdata, setroomdata] = useState([]);
  const [reviewdata, setreviewdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [darkMode] = useState(false);

  // Pagination state
  const [bookingPage, setBookingPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  const token=localStorage.getItem('token')
  const navigate=useNavigate()

  const fetchrooms = useCallback(async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/room/getallhotelrooms/${hotelemail}?search&&status=active`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
      );
      setroomdata(result?.data?.response || []);
    } catch (err) {
      if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.error("Error fetching rooms:", err);
    }
  }, [hotelemail]);

  const fetchbooking = useCallback(async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/hotelbooking/${hotelemail}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
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
      console.error("Error fetching bookings:", err);
    }
  }, [hotelemail]);

  const fetchreviews = useCallback(async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/review/hotelreviews/${hotelemail}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
      );
      setreviewdata(result?.data?.result || []);
    } catch (err) {
      if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
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

  // Reset booking page when filter changes
  useEffect(() => {
    setBookingPage(1);
  }, [bookingFilter]);

  // Analytics & Availability Computations
  const metrics = useMemo(() => {
    const completedBookings = bookingdata.filter(b => b.bookingstatus === 'completed');
    const cancelledBookings = bookingdata.filter(b => b.bookingstatus === 'cancelled');
    
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const avgRating = reviewdata.length > 0
      ? (reviewdata.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewdata.length).toFixed(1)
      : 'N/A';

    const hotelInfo = roomdata[0]?.hotel_id || {};

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

  // Paginated bookings
  const bookingTotalPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const start = (bookingPage - 1) * BOOKINGS_PER_PAGE;
    return filteredBookings.slice(start, start + BOOKINGS_PER_PAGE);
  }, [filteredBookings, bookingPage]);

  // Paginated reviews
  const reviewTotalPages = Math.ceil(reviewdata.length / REVIEWS_PER_PAGE);
  const paginatedReviews = useMemo(() => {
    const start = (reviewPage - 1) * REVIEWS_PER_PAGE;
    return reviewdata.slice(start, start + REVIEWS_PER_PAGE);
  }, [reviewdata, reviewPage]);

  // SVG Pie Chart Helper
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
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">&#8377;{metrics.totalRevenue.toLocaleString()}</h3>
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
                  {metrics.avgRating} <span className="text-amber-400 text-lg">&#9733;</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{reviewdata.length} total reviews</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 2. Booking Records Table with Pagination */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Booking Records</h2>
                <button onClick={handleDownloadPDF} className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1.5 transition-colors">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                  {filteredBookings.length} records
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'active', 'completed', 'cancelled'].map((status) => (
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
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Guest Details</th>
                    <th className="px-4 py-3">Room Info</th>
                    <th className="px-4 py-3">Check-In</th>
                    <th className="px-4 py-3">Check-Out</th>
                    <th className="px-4 py-3">Total Price</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400 dark:text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <CalendarCheck className="w-8 h-8 opacity-40" />
                          No matching booking records found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((b, idx) => {
                      const rowNum = (bookingPage - 1) * BOOKINGS_PER_PAGE + idx + 1;
                      return (
                        <tr key={b._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-medium">{rowNum}</td>
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                                {(b.user?.name || 'G').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{b.user?.name || "Guest"}</div>
                                <div className="text-[11px] text-slate-400 dark:text-slate-500">{b.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold">Room {b.room?.roomno || 'N/A'}</span>
                            <span className="text-slate-400 dark:text-slate-500 ml-1">({b.room?.roomtype})</span>
                          </td>
                          <td className="px-4 py-3">{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-3">{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">&#8377;{b.totalPrice?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                              b.bookingstatus === 'completed' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                                : b.bookingstatus === 'active'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            }`}>
                              {b.bookingstatus === 'cancelled' 
                                ? <XCircle className="w-3 h-3" /> 
                                : <CheckCircle2 className="w-3 h-3" />}
                              {b.bookingstatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bookings Pagination */}
            <Pagination
              currentPage={bookingPage}
              totalPages={bookingTotalPages}
              onPageChange={setBookingPage}
              label={`${filteredBookings.length} total`}
            />
          </div>

          {/* 3. Customer Reviews Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
            {/* Reviews Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" /> Customer Reviews
                </h2>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                  {reviewdata.length} reviews
                </span>
              </div>
              {metrics.avgRating !== 'N/A' && (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(parseFloat(metrics.avgRating))} />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{metrics.avgRating}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">avg rating</span>
                </div>
              )}
            </div>

            {reviewdata.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400 dark:text-slate-500">
                <Star className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium text-sm">No reviews yet</p>
                <p className="text-xs mt-1 opacity-70">Guest reviews will appear here after check-out</p>
              </div>
            ) : (
              <>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedReviews.map((rev, idx) => {
                    const userName = rev.userId?.name || 'Guest';
                    const userEmail = rev.userId?.email || '';
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
                        {/* Reviewer Info */}
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

                        {/* Star Rating */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <StarRating rating={rev.rating || 0} />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{rev.rating}/5</span>
                        </div>

                        {/* Review Text */}
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

                {/* Reviews Pagination */}
                <Pagination
                  currentPage={reviewPage}
                  totalPages={reviewTotalPages}
                  onPageChange={setReviewPage}
                  label={`${reviewdata.length} total`}
                />
              </>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default Hoteldashboard;
