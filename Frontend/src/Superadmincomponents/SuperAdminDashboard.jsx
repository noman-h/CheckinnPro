import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Building2,
  Users,
  BedDouble,
  CreditCard,
  Search,
  Download,
  Loader2,
  Calendar,
  CheckCircle2,
  BedSingle,
  Clock,
  TrendingUp,
  XCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// API FETCHERS
// ==========================================


// ==========================================
// SUB-COMPONENT: TABBED PIE CHART WIDGET
// ==========================================

function PieChartWidget({ bookingData, hotelData, roomData, inventoryData }) {
  const [activeTab, setActiveTab] = useState('bookings');

  const getChartConfig = () => {
    switch (activeTab) {
      case 'bookings':
        return { title: 'Booking Status', data: bookingData };
      case 'hotels':
        return { title: 'Hotel Approvals', data: hotelData };
      case 'rooms':
        return { title: 'Room Occupancy', data: roomData };
      case 'inventory':
      default:
        return { title: 'Total Inventory', data: inventoryData };
    }
  };

  const currentConfig = getChartConfig();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-1">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {currentConfig.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Distribution analysis</p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {[
          { id: 'bookings', label: 'Bookings' },
          { id: 'hotels', label: 'Hotels' },
          { id: 'rooms', label: 'Rooms' },
          { id: 'inventory', label: 'Overview' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RECHARTS PIE */}
      <div className="h-56 w-full">
        {currentConfig.data && currentConfig.data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentConfig.data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {currentConfig.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend verticalAlign="bottom" height={32} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No status data available
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

function SuperAdminDashboard() {
  const navigate = useNavigate();

  const token=localStorage.getItem('token')

//api fetch functions  
const fetchAdmins = async () => {
  try {
    const res = await axios.get(`${API_URL}/admin/getalladmins`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
    if (Array.isArray(res.data)) return res.data;
    return res.data?.admins || res.data?.response || res.data?.result || [];
  } catch (err) {
     if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
    console.error('Error fetching admins:', err);
    return [];
  }
};

const fetchHotels = async () => {
  try {
    const res = await axios.get(`${API_URL}/hotel/getallhotels`);
    if (Array.isArray(res.data)) return res.data;
    return res.data?.response || res.data?.hotels || res.data?.result || [];
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return [];
  }
};

const fetchRooms = async () => {
  try {
    const res = await axios.get(`${API_URL}/room/getallrooms`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
    if (Array.isArray(res.data)) return res.data;
    return res.data?.response || res.data?.rooms || res.data?.result || [];
  } catch (err) {
     if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
    console.error('Error fetching rooms:', err);
    return [];
  }
};

const fetchBookings = async () => {
  try {
    const res = await axios.get(`${API_URL}/booking/allbooking`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
    if (Array.isArray(res.data)) return res.data;
    return res.data?.result || res.data?.bookings || res.data?.response || [];
  } catch (err) {
     if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
    console.error('Error fetching bookings:', err);
    return [];
  }
};

  // API Data States for KPI cards (unaffected by booking filters)
  const [admins, setAdmins] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Bookings table state (server-side)
  const [bookings, setBookings] = useState([]);
  const [bookingTotalCount, setBookingTotalCount] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingSort, setBookingSort] = useState('newest');
  const [bookingRange, setBookingRange] = useState('alltime');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingLimit, setBookingLimit] = useState(8);

  const debouncedSearch = searchTerm;

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load KPI data only once
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminsData, hotelsData, roomsData] = await Promise.all([
        fetchAdmins(),
        fetchHotels(),
        fetchRooms(),
      ]);
      setAdmins(adminsData);
      setHotels(hotelsData);
      setRooms(roomsData);
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
      setError('Failed to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Server-side booking fetch
  const fetchBookingsData = async () => {
    setBookingLoading(true);
    try {
      const skip = (bookingPage - 1) * bookingLimit;
      const params = new URLSearchParams({
        search: debouncedSearch,
        sort: bookingSort,
        range: bookingRange,
        skip,
        limit: bookingLimit,
      });
      if (bookingRange === 'custom' && customStart && customEnd) {
        params.set('startDate', customStart);
        params.set('endDate', customEnd);
      }
      const res = await axios.get(`${API_URL}/booking/allbooking?${params.toString()}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
      const data = res.data;
      setBookings(data.result || []);
      setBookingTotalCount(data.totalcount ?? 0);
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  // Reset page when filters change
  useEffect(() => { setBookingPage(1); }, [debouncedSearch, bookingSort, bookingRange, customStart, customEnd, bookingLimit]);

  // Fetch bookings whenever filters or page changes
  useEffect(() => { fetchBookingsData(); }, [debouncedSearch, bookingSort, bookingRange, customStart, customEnd, bookingPage, bookingLimit]);

  // Compute Admin Status Metrics
  const adminMetrics = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let pending = 0;
    let rejected = 0;

    admins.forEach((admin) => {
      const approveStatus = (admin.approveStatus || admin.status || '').toString().toLowerCase();
      const activeStatus = admin.activeStatus;

      if (approveStatus === 'pending') {
        pending += 1;
      } else if (approveStatus === 'rejected') {
        rejected += 1;
      } else if (approveStatus === 'approved') {
        if (activeStatus === true) {
          active += 1;
        } else {
          inactive += 1;
        }
      } else {
        if (activeStatus === false) {
          inactive += 1;
        } else {
          active += 1;
        }
      }
    });

    return { total: admins.length, active, inactive, pending, rejected };
  }, [admins]);

  // Compute Hotel Status Metrics
  const hotelMetrics = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let pending = 0;
    let rejected = 0;

    hotels.forEach((hotel) => {
      const approveStatus = (hotel.approveStatus || hotel.status || '').toString().toLowerCase();
      const activeStatus = hotel.activeStatus;

      if (approveStatus === 'pending') {
        pending += 1;
      } else if (approveStatus === 'rejected') {
        rejected += 1;
      } else if (approveStatus === 'approved') {
        if (activeStatus === true) {
          active += 1;
        } else {
          inactive += 1;
        }
      } else {
        if (activeStatus === false) {
          inactive += 1;
        } else {
          active += 1;
        }
      }
    });

    return { total: hotels.length, active, inactive, pending, rejected };
  }, [hotels]);

  // Compute Platform Revenue (from ALL bookings for KPI — fetched fresh)
  const [allBookingsForKpi, setAllBookingsForKpi] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/booking/allbooking?limit=10000`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
      .then(res => setAllBookingsForKpi(res.data.result || []))
      .catch(() => {});
  }, []);

  const revenueMetrics = useMemo(() => {
    let totalPlatformRevenue = 0;
    let completedBookingsCount = 0;
    const monthlyMap = {};

    allBookingsForKpi.forEach((booking) => {
      const statusStr = (
        booking.bookingstatus ||
        booking.status ||
        booking.bookingStatus ||
        ''
      ).toLowerCase();

      const isCompleted = statusStr === 'completed' || statusStr === 'checked_out';
      const bookingAmount = Number(booking.totalPrice || booking.totalAmount || booking.price || booking.amount || 0);
      const commission = isCompleted ? bookingAmount * 0.05 : 0;

      if (isCompleted) {
        totalPlatformRevenue += commission;
        completedBookingsCount += 1;
      }

      const dateStr = booking.createdAt || booking.checkIn;
      if (dateStr) {
        const monthName = new Date(dateStr).toLocaleString('default', { month: 'short' });
        if (!monthlyMap[monthName]) monthlyMap[monthName] = { month: monthName, revenue: 0, totalBookings: 0 };
        monthlyMap[monthName].revenue += commission;
        monthlyMap[monthName].totalBookings += 1;
      }
    });

    const chartData = Object.values(monthlyMap);
    return {
      totalPlatformRevenue,
      completedBookingsCount,
      chartData: chartData.length > 0 ? chartData : [{ month: 'Jul', revenue: 0, totalBookings: 0 }]
    };
  }, [allBookingsForKpi]);

  // Compute Room Status Metrics
  const roomMetrics = useMemo(() => {
    const today = new Date();

    const occupiedRoomIds = new Set(
      allBookingsForKpi
        .filter((b) => {
          const checkIn = new Date(b.checkIn);
          const checkOut = new Date(b.checkOut);
          return (
            b.bookingstatus === "active" &&
            today >= checkIn &&
            today < checkOut
          );
        })
        .map((b) => (typeof b.roomId === "object" ? b.roomId._id : b.roomId))
    );

    let activeInUse = 0;
    let available = 0;
    let pending = 0;
    let disabled = 0;

    rooms.forEach((room) => {
      const isActive = room.activestatus ?? room.activeStatus ?? true;
      if (!isActive) disabled += 1;
      else if (occupiedRoomIds.has(room._id)) activeInUse += 1;
      else available += 1;
    });

    const pendingRoomIds = new Set(
      allBookingsForKpi
        .filter((b) => b.bookingstatus === "pending")
        .map((b) => (typeof b.roomId === "object" ? b.roomId._id : b.roomId))
    );
    pending = pendingRoomIds.size;

    return { total: rooms.length, activeInUse, available, pending, disabled };
  }, [rooms, allBookingsForKpi]);

  // 1. Booking Status Distribution (for Pie Widget)
  const bookingStatusPieData = useMemo(() => {
    const counts = { completed: 0, active: 0, pending: 0, cancelled: 0 };
    allBookingsForKpi.forEach((b) => {
      const status = (b.bookingstatus || b.status || '').toLowerCase();
      if (status === 'completed' || status === 'checked_out') counts.completed += 1;
      else if (status === 'active' || status === 'checked_in') counts.active += 1;
      else if (status === 'cancelled') counts.cancelled += 1;
      else counts.pending += 1;
    });
    return [
      { name: 'Completed', value: counts.completed, color: '#10b981' },
      { name: 'Active Stay', value: counts.active, color: '#06b6d4' },
      { name: 'Pending', value: counts.pending, color: '#f59e0b' },
      { name: 'Cancelled', value: counts.cancelled, color: '#f43f5e' }
    ].filter((d) => d.value > 0);
  }, [allBookingsForKpi]);

  // 2. Hotel Status Breakdown (for Pie Widget)
  const hotelStatusPieData = useMemo(() => {
    return [
      { name: 'Active', value: hotelMetrics.active, color: '#10b981' },
      { name: 'Inactive', value: hotelMetrics.inactive, color: '#64748b' },
      { name: 'Pending', value: hotelMetrics.pending, color: '#f59e0b' },
      { name: 'Rejected', value: hotelMetrics.rejected, color: '#f43f5e' }
    ].filter((d) => d.value > 0);
  }, [hotelMetrics]);

  // 3. Room Occupancy Breakdown (for Pie Widget)
  const roomStatusPieData = useMemo(() => {
    return [
      { name: 'Available', value: roomMetrics.available, color: '#10b981' },
      { name: 'Occupied', value: roomMetrics.activeInUse, color: '#6366f1' },
      { name: 'Pending Check-in', value: roomMetrics.pending, color: '#f59e0b' },
      { name: 'Disabled', value: roomMetrics.disabled, color: '#64748b' }
    ].filter((d) => d.value > 0);
  }, [roomMetrics]);

  // 4. Inventory Distribution Data (for Pie Widget Overview)
  const distributionPieData = useMemo(() => {
    return [
      { name: 'Hotels', value: hotels.length, color: '#4f46e5' },
      { name: 'Rooms', value: rooms.length, color: '#06b6d4' },
      { name: 'Bookings', value: allBookingsForKpi.length, color: '#10b981' }
    ].filter((d) => d.value > 0);
  }, [hotels.length, rooms.length, allBookingsForKpi.length]);

  // Booking pagination helpers
  const bookingTotalPages = Math.ceil(bookingTotalCount / bookingLimit) || 1;
  const bookingStartItem = bookingTotalCount === 0 ? 0 : (bookingPage - 1) * bookingLimit + 1;
  const bookingEndItem = Math.min(bookingPage * bookingLimit, bookingTotalCount);

  const getBookingPageNumbers = () => {
    const pages = [];
    if (bookingTotalPages <= 5) {
      for (let i = 1; i <= bookingTotalPages; i++) pages.push(i);
    } else {
      if (bookingPage <= 3) pages.push(1, 2, 3, 4, '...', bookingTotalPages);
      else if (bookingPage >= bookingTotalPages - 2) pages.push(1, '...', bookingTotalPages - 3, bookingTotalPages - 2, bookingTotalPages - 1, bookingTotalPages);
      else pages.push(1, '...', bookingPage - 1, bookingPage, bookingPage + 1, '...', bookingTotalPages);
    }
    return pages;
  };
  
  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/download/pdf`,
        { tasks: bookings },
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
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="font-sans text-slate-800 transition-colors duration-200 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Super Admin Analytics & Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Platform earnings (5% commission on completed stays), inventory, and booking monitoring.
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> Refresh Data
          </button>
        </div>

        {/* TOP KPI CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">

          {/* REVENUE CARD */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/20 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                5% Platform Cut
              </p>
              <div className="rounded-full bg-indigo-600 p-2 text-white shadow">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{revenueMetrics.totalPlatformRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </h3>
              <span className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3" /> From {revenueMetrics.completedBookingsCount} completed stays
              </span>
            </div>
          </div>

          {/* SINGLE COMPACT ADMINS CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Admins</p>
              <div className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Users className="h-4 w-4" />
              </div>
            </div>

            <h3 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
              {adminMetrics.total}
            </h3>

            <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-2 text-xs font-medium dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{adminMetrics.active}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  Inactive
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{adminMetrics.inactive}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Pending
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{adminMetrics.pending}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Rejected
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{adminMetrics.rejected}</span>
              </div>
            </div>
          </div>

          {/* SINGLE COMPACT HOTELS CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Hotels</p>
              <div className="rounded-full bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                <Building2 className="h-4 w-4" />
              </div>
            </div>

            <h3 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
              {hotelMetrics.total}
            </h3>

            <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-2 text-xs font-medium dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{hotelMetrics.active}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  Inactive
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{hotelMetrics.inactive}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Pending
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{hotelMetrics.pending}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Rejected
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{hotelMetrics.rejected}</span>
              </div>
            </div>
          </div>

          {/* SINGLE COMPACT ROOMS KPI CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Rooms</p>
              <div className="rounded-full bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                <BedSingle className="h-4 w-4" />
              </div>
            </div>

            <h3 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
              {roomMetrics.total}
            </h3>

            <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-2 text-xs font-medium dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Available
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{roomMetrics.available}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Currently In Use
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{roomMetrics.activeInUse}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Pending
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{roomMetrics.pending}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  Disabled / Maintenance
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{roomMetrics.disabled}</span>
              </div>
            </div>
          </div>

          {/* BOOKINGS CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bookings</p>
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">{bookings.length}</h3>
          </div>

        </div>

        {/* CHARTS GRID */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* AREA CHART */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Monthly Platform Commission</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Calculated from completed stays</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                Live Data
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueMetrics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(val) => [`₹${Number(val).toFixed(2)}`, '5% Cut']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABBED PIE CHART WIDGET */}
          <PieChartWidget
            bookingData={bookingStatusPieData}
            hotelData={hotelStatusPieData}
            roomData={roomStatusPieData}
            inventoryData={distributionPieData}
          />

        </div>

        {/* BOOKINGS SECTION HEADER & FILTERS */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Bookings &amp; Platform Cuts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Server-side search, filter by date range, and sort</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleDownloadPDF} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2">
                <Download className="h-4 w-4" /> PDF
              </button>
              <div className="relative sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by user, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Date Range + Sort Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {[
                { id: 'alltime', label: 'All Time' },
                { id: 'week', label: 'Week' },
                { id: '6months', label: '6 Months' },
                { id: 'custom', label: 'Custom' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBookingRange(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    bookingRange === tab.id
                      ? 'bg-white text-indigo-600 shadow dark:bg-slate-900 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers */}
            {bookingRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </>
            )}

            {/* Sort */}
            <select
              value={bookingSort}
              onChange={(e) => setBookingSort(e.target.value)}
              className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highprice">Price: High → Low</option>
              <option value="lowprice">Price: Low → High</option>
            </select>
          </div>
        </div>

        {/* BOOKINGS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow dark:border-slate-700 dark:bg-slate-900">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              {bookingLoading && (
                <div className="flex items-center justify-center gap-2 border-b border-slate-200 bg-indigo-50 py-2 text-xs text-indigo-600 dark:border-slate-700 dark:bg-indigo-950/30 dark:text-indigo-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Updating...
                </div>
              )}
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Booking ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Super Admin Cut (5%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                        No bookings found
                      </td>
                    </tr>
                  ) : bookings.map((booking) => {
                    const amount = Number(booking.totalPrice || booking.totalAmount || booking.price || 0);
                    const statusStr = (booking.bookingstatus || booking.status || '').toLowerCase();
                    const isCompleted = statusStr === 'completed' || statusStr === 'checked_out';
                    const isCancelled = statusStr === 'cancelled';
                    const cut = isCompleted ? amount * 0.05 : 0;

                    return (
                      <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-mono text-xs">{booking._id}</td>
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                          {booking.userId?.name || 'Guest User'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : isCancelled ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {booking.bookingstatus || booking.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">₹{amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                          {isCompleted ? `₹${cut.toFixed(2)}` : '₹0.00'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {!loading && !error && bookingTotalCount > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white">{bookingStartItem}</strong> to{' '}
                  <strong className="text-slate-900 dark:text-white">{bookingEndItem}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white">{bookingTotalCount}</strong> bookings
                </span>
                <div className="flex items-center gap-1.5">
                  <label className="text-xs">Show:</label>
                  <select
                    value={bookingLimit}
                    onChange={(e) => { setBookingLimit(Number(e.target.value)); setBookingPage(1); }}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value={5}>5</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  onClick={() => setBookingPage((p) => Math.max(p - 1, 1))}
                  disabled={bookingPage === 1}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {getBookingPageNumbers().map((p, idx) =>
                    p === '...' ? (
                      <span key={`d${idx}`} className="px-1.5 text-xs text-slate-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setBookingPage(p)}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                          bookingPage === p
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setBookingPage((p) => Math.min(p + 1, bookingTotalPages))}
                  disabled={bookingPage === bookingTotalPages}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SuperAdminDashboard;