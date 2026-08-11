import axios from 'axios';
import React, { useEffect, useState } from 'react';
import UseDebouncing from '../Hooks/UseDebouncing';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';

function Adminbookings() {
  const navigate=useNavigate()
  const [search, setsearch] = useState("");
  const [sort, setsort] = useState("");

  // --- 1. PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(4); // Controls HOW MUCH data to show per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  const debouncedvalue = UseDebouncing(search, 1000);
  const adminemail = localStorage.getItem("email");

  const [bookingdata, setbookingdata] = useState([]);
  const [view, setview] = useState(null);

  const token=localStorage.getItem('token')

  // --- 2. FETCH DATA WITH LIMIT & SKIP LOGIC ---
  async function fetchbooking() {
    try {
      // Calculate MongoDB offset/skip index: (currentPage - 1) * limit
      const skip = (currentPage - 1) * limit;

      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/alladminbooking/${adminemail}?search=${debouncedvalue}&sort=${sort}&page=${currentPage}&limit=${limit}&skip=${skip}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      
      const responseData = result?.data?.response || [];
      setbookingdata(responseData);

      // Total count from API response
      const count = result?.data?.totalcount ?? responseData.length;
      setTotalBookings(count);

      // Total pages calculation: Math.ceil(total / limit)
      setTotalPages(Math.ceil(count / limit) || 1);
  
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
  }
  

  async function handleview(bookid) {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/booking/bookingview/${bookid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setview(result?.data?.result);
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      alert(err);
    }
  }

  async function handlecheckin(bookid) {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/booking/bookingcheckin/${bookid}`,{},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchbooking();
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      alert(err);
    }
  }

  async function handlecheckout(bookid) {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/booking/bookingcheckout/${bookid}`,{},{
          headers: { Authorization: `Bearer ${token}` },
        });
      fetchbooking();
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      alert(err);
    }
  }

  async function handlecancel(bookid) {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/booking/bookingcancel/${bookid}`,{},{
          headers: { Authorization: `Bearer ${token}` },
        });
      fetchbooking();
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      alert(err);
    }
  }

  // Reset to page 1 whenever search or sort filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedvalue, sort]);

  // Refetch bookings when page number, row limit, search, or sorting changes
  useEffect(() => {
    fetchbooking();
  }, [currentPage, limit, sort, debouncedvalue]);

  // --- 3. PAGE NUMBERS GENERATOR (1, 2, 3 ... 10) ---
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 1) pages.push(1, '...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) pages.push('...', totalPages);
    }

    return pages;
  };

  // --- 4. CALCULATE DISPLAY RANGES (e.g., Showing 1 - 5 of 23) ---
  const startItem = totalBookings === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalBookings);

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/download/pdf`,
        { pdfdata: bookingdata },
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
    <div className="manage-page w-full p-4 text-slate-800 dark:text-slate-100">
      
      {/* --- TOP BAR: SEARCH, SORT & DATA LIMIT CONTROL --- */}
      <div className="flex w-full flex-col gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by room and hotels..."
            value={search}
            onChange={(e) => setsearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:w-64"
          />

          <select
            value={sort}
            onChange={(e) => setsort(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
          >
            <option value="">No sorting</option>
            <option value="newest">New booking</option>
            <option value="oldest">Old booking</option>
          </select>
        </div>

        {/* LOGIC 1: HOW MUCH DATA TO SHOW (LIMIT SELECTOR) */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
           <button onClick={handleDownloadPDF} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2">
                <Download className="h-4 w-4" /> PDF
              </button>

          <span>Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1); // Always reset to page 1 when changing page size
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value={4}>4 rows</option>
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>

      {/* --- BOOKINGS LIST --- */}
      <div className="my-4 flex flex-col gap-4 font-sans">
        {bookingdata.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No bookings found
          </div>
        ) : (
          bookingdata.map((item) => {
            const hotel = item.hotels || {};
            const room = item.room || {};
            const user = item.user || {};

            return (
              <div
                key={item._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 md:flex-row md:items-center md:justify-between"
              >
                {/* Booking Details */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/80 dark:text-emerald-400">
                      Room {room.roomno || "N/A"}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-0.5 text-xs font-semibold capitalize
                        ${
                          item.bookingstatus === "pending"
                            ? "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
                            : ""
                        }
                        ${
                          item.bookingstatus === "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : ""
                        }
                        ${
                          item.bookingstatus === "completed"
                            ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400"
                            : ""
                        }
                        ${
                          item.bookingstatus === "cancelled"
                            ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                            : ""
                        }
                      `}
                    >
                      {item.bookingstatus || "Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-8">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hotel</p>
                      <p className="mt-1 truncate text-sm font-bold capitalize text-slate-900 dark:text-white">
                        {hotel.hotelName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Guest</p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
                        {user.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Dates</p>
                      <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                        {item.checkIn?.split("T")[0]} to {item.checkOut?.split("T")[0]}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Price</p>
                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        ₹{item.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 md:pt-0">
                  <button
                    onClick={() => handleview(item._id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/40"
                  >
                    View
                  </button>

                  <button
                    onClick={() => handlecheckin(item._id)}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900/30 dark:bg-[#271d12] dark:text-amber-500"
                  >
                    Check In
                  </button>

                  <button
                    onClick={() => handlecheckout(item._id)}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-[#1e1b4b] dark:text-indigo-400"
                  >
                    Check Out
                  </button>

                  <button
                    onClick={() => handlecancel(item._id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-rose-900/30 dark:bg-[#2c131a] dark:text-rose-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- LOGIC 2: WHICH PAGE TO SHOW (PAGINATION CONTROLS & RANGE DISPLAY) --- */}
      {totalBookings > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-2 pt-4 dark:border-slate-800 sm:flex-row">
          
          {/* Detailed Item Range Display */}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-800 dark:text-white">{startItem}</span> to{" "}
            <span className="font-semibold text-slate-800 dark:text-white">{endItem}</span> of{" "}
            <span className="font-semibold text-slate-800 dark:text-white">{totalBookings}</span> bookings
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Previous
            </button>

            {/* Dynamic Page Number Buttons */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, idx) =>
                pageNum === '...' ? (
                  <span key={`dots-${idx}`} className="px-1.5 text-xs text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                      currentPage === pageNum
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOG --- */}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Booking Details</h2>
              <button
                onClick={() => setview(null)}
                className="rounded-lg p-1 text-2xl text-slate-500 transition hover:text-red-500"
              >
                &times;
              </button>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <img
                  src={view.roomId?.image1}
                  alt="Room"
                  className="h-56 w-full rounded-xl object-cover"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Guest Name</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{view.userId?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="break-all font-semibold text-slate-800 dark:text-white">{view.userId?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{view.userId?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Guests</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{view.guests}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Room No</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{view.roomId?.roomno}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Room Type</p>
                    <p className="font-semibold capitalize text-slate-800 dark:text-white">{view.roomId?.roomtype}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Room Price</p>
                    <p className="font-semibold text-emerald-600">₹{view.roomId?.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Paid</p>
                    <p className="text-lg font-bold text-indigo-600">₹{view.totalPrice}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-3 dark:border-slate-700">
              <button
                onClick={() => setview(null)}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Adminbookings;