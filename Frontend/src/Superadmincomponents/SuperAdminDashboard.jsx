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

const fetchAdmins = async () => {
  try {
    const res = await axios.get(`${API_URL}/admin/getalladmins`);
    if (Array.isArray(res.data)) return res.data;
    return res.data?.admins || res.data?.response || res.data?.result || [];
  } catch (error) {
    console.error('Error fetching admins:', error);
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
    const res = await axios.get(`${API_URL}/room/getallrooms`);
    if (Array.isArray(res.data)) return res.data;
    return res.data?.response || res.data?.rooms || res.data?.result || [];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

const fetchBookings = async () => {
  try {
    const res = await axios.get(`${API_URL}/booking/allbooking`);
    if (Array.isArray(res.data)) return res.data;
    return res.data?.result || res.data?.bookings || res.data?.response || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};

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
            className={`flex-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
              activeTab === tab.id
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

  // API Data States
  const [admins, setAdmins] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [adminsData, hotelsData, roomsData, bookingsData] = await Promise.all([
        fetchAdmins(),
        fetchHotels(),
        fetchRooms(),
        fetchBookings()
      ]);

      setAdmins(adminsData);
      setHotels(hotelsData);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
      setError('Failed to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  // Compute Platform Revenue
  const revenueMetrics = useMemo(() => {
    let totalPlatformRevenue = 0;
    let completedBookingsCount = 0;
    const monthlyMap = {};

    bookings.forEach((booking) => {
      const statusStr = (
        booking.bookingstatus ||
        booking.status ||
        booking.bookingStatus ||
        ''
      ).toLowerCase();

      const isCompleted = statusStr === 'completed' || statusStr === 'checked_out';

      const bookingAmount = Number(
        booking.totalPrice || booking.totalAmount || booking.price || booking.amount || 0
      );

      const commission = isCompleted ? bookingAmount * 0.05 : 0;

      if (isCompleted) {
        totalPlatformRevenue += commission;
        completedBookingsCount += 1;
      }

      const dateStr = booking.createdAt || booking.checkIn;
      if (dateStr) {
        const monthName = new Date(dateStr).toLocaleString('default', { month: 'short' });
        if (!monthlyMap[monthName]) {
          monthlyMap[monthName] = { month: monthName, revenue: 0, totalBookings: 0 };
        }
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
  }, [bookings]);

  // Compute Room Status Metrics
  const roomMetrics = useMemo(() => {
    const today = new Date("2026-08-03T00:00:00.000Z");

    const occupiedRoomIds = new Set(
      bookings
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

      if (!isActive) {
        disabled += 1;
      } else if (occupiedRoomIds.has(room._id)) {
        activeInUse += 1;
      } else {
        available += 1;
      }
    });

    const pendingRoomIds = new Set(
      bookings
        .filter((b) => {
          const checkIn = new Date(b.checkIn);
          return (
            b.bookingstatus === "pending" &&
            checkIn.getTime() === today.getTime()
          );
        })
        .map((b) => (typeof b.roomId === "object" ? b.roomId._id : b.roomId))
    );

    pending = pendingRoomIds.size;

    return {
      total: rooms.length,
      activeInUse,
      available,
      pending,
      disabled,
    };
  }, [rooms, bookings]);

  // 1. Booking Status Distribution (for Pie Widget)
  const bookingStatusPieData = useMemo(() => {
    const counts = { completed: 0, active: 0, pending: 0, cancelled: 0 };

    bookings.forEach((b) => {
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
  }, [bookings]);

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
      { name: 'Bookings', value: bookings.length, color: '#10b981' }
    ].filter((d) => d.value > 0);
  }, [hotels.length, rooms.length, bookings.length]);

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

        {/* SEARCH BAR & HEADER FOR BOOKINGS */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Bookings & Platform Cuts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Displaying revenue cuts per booking</p>
          </div>

          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Status, or User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* SINGLE BOOKINGS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow dark:border-slate-700 dark:bg-slate-900">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
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
                  {bookings
                    .filter((b) => {
                      const id = b._id || '';
                      const status = b.bookingstatus || b.status || '';
                      const userName = b.userId?.name || '';
                      const term = searchTerm.toLowerCase();
                      return (
                        id.toLowerCase().includes(term) ||
                        status.toLowerCase().includes(term) ||
                        userName.toLowerCase().includes(term)
                      );
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.createdAt || a.checkIn || 0);
                      const dateB = new Date(b.createdAt || b.checkIn || 0);
                      return dateB - dateA;
                    })
                    .map((booking) => {
                      const amount = Number(
                        booking.totalPrice || booking.totalAmount || booking.price || 0
                      );
                      const statusStr = (
                        booking.bookingstatus ||
                        booking.status ||
                        ''
                      ).toLowerCase();

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
                              {isCompleted ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : isCancelled ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
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
        </div>

      </div>
    </div>
  );
}

export default SuperAdminDashboard;