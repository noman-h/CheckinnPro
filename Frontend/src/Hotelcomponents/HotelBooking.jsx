import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import UseDebouncing from '../Hooks/UseDebouncing';

function HotelBooking() {

  const navigate=useNavigate()
 
    const [search,setsearch]=useState("")
    const [sort,setsort]=useState("")

    const debouncedvalue=UseDebouncing(search,1000)
    const hotelemail=localStorage.getItem("email")
   
    const [bookingdata,setbookingdata]=useState([])
    const [view,setview]=useState(null)

    // --- PAGINATION STATES ---
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);

    async function fetchbooking() {
        try{
          const skip = (currentPage - 1) * limit;
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/booking/hotelbooking/${hotelemail}?search=${debouncedvalue}&sort=${sort}&page=${currentPage}&limit=${limit}&skip=${skip}`)
           
           const responseData = result?.data?.response || [];
           setbookingdata(responseData)

           const count = result?.data?.totalcount ?? responseData.length;
           setTotalBookings(count);
           setTotalPages(Math.ceil(count / limit) || 1);
        }
        catch(err){
           console.log(err);
        }
    }

     async function handleview(bookid) {
        try{
          const result=await axios.get(`${import.meta.env.VITE_API_URL}/booking/bookingview/${bookid}`)
         
          setview(result?.data?.result)
        }
        catch(err){
             alert(err)
        }
    }

    

    async function handlecheckin(bookid) {
        try{
          const result=await axios.patch(`${import.meta.env.VITE_API_URL}/booking/bookingcheckin/${bookid}`)
         fetchbooking()
        }
        catch(err){
             alert(err)
        }
    }

    async function handlecheckout(bookid) {
        try{
          const result=await axios.patch(`${import.meta.env.VITE_API_URL}/booking/bookingcheckout/${bookid}`)
          fetchbooking()
        }
        catch(err){
             alert(err)
        }
    }

    async function handlecancel(bookid) {
        try{
            
            const result=await axios.patch(`${import.meta.env.VITE_API_URL}/booking/bookingcancel/${bookid}`)
            console.log("heyyy");
            fetchbooking()
        }
        catch(err){
             alert(err)
        }
    }
   console.log(view);
   
   

    // Reset to page 1 whenever search or sort filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [debouncedvalue, sort]);

    useEffect(()=>{
     fetchbooking()
    },[debouncedvalue, sort, currentPage, limit])

    // --- PAGE NUMBERS GENERATOR ---
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
      }
      return pages;
    };

  console.log(bookingdata);
  

    const filteredbooking=bookingdata



  return (
   <div className="manage-page w-full p-3 text-slate-800 dark:text-slate-100">
          <div className="flex w-full flex-col gap-3 pb-3">
         
            <div className="flex flex-wrap gap-2">

              <input
                type="text"
                placeholder="Search by room and hotels..."
                value={search}
                onChange={(e) => setsearch(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:max-w-xs"
              />

              <select
                value={sort}
                onChange={(e) => setsort(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
              >
                <option value="">No sorting</option>
                <option value="newest">New booking</option>
                <option value="oldest">Old booking</option>
              </select>
            </div>
          </div>

        

       <div className="flex flex-col gap-4 bg-slate-50 p-4 font-sans text-slate-700 dark:bg-slate-950 dark:text-slate-300">
  {filteredbooking.length === 0 ? (
    <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      No bookings found
    </div>
  ) : (
    filteredbooking.map((item) => {
      const hotel = item.hotels || {};
      const room = item.room || {};
      const user = item.user || {};

      return (
        <div
          key={item._id}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 md:flex-row md:items-center md:justify-between"
        >
          {/* Left */}
          <div className="flex flex-col gap-4">

            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/80 dark:text-emerald-400">
                Room {room.roomno || "N/A"}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize
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

            {/* Grid */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:gap-8">

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Guest
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Dates
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  From: {item.checkIn.split("T")[0]}
                  <br />
                  To: {item.checkOut.split("T")[0]}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Price
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  ₹{item.totalPrice}
                </p>
              </div>

            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 md:pt-0">

            <button
              onClick={() => handleview(item._id)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-950/40"
            >
              View
            </button>

            <button
              onClick={() => handlecheckin(item._id)}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/30 dark:bg-[#271d12] dark:text-amber-500 dark:hover:bg-amber-950/50"
            >
              Check In
            </button>

            <button
              onClick={() => handlecheckout(item._id)}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-[#1e1b4b] dark:text-indigo-400 dark:hover:bg-indigo-950/50"
            >
              Check Out
            </button>

            <button
              onClick={() => handlecancel(item._id)}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-rose-900/30 dark:bg-[#2c131a] dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              Cancel
            </button>

          </div>
        </div>
      );
    })
  )}
</div>

{/* --- PAGINATION CONTROLS --- */}
{totalBookings > 0 && (
  <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
    
    {/* Left Side: Items Count & Limit Selector */}
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
      <span>
        Showing <strong className="text-slate-900 dark:text-white">{(currentPage - 1) * limit + 1}</strong> to{" "}
        <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * limit, totalBookings)}</strong> of{" "}
        <strong className="text-slate-900 dark:text-white">{totalBookings}</strong> entries
      </span>

      <div className="flex items-center gap-1.5">
        <label htmlFor="limit-select">Show:</label>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value={4}>4</option>
          <option value={6}>6</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
    </div>

    {/* Right Side: Navigation Buttons */}
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, idx) =>
          pageNum === '...' ? (
            <span key={`dots-${idx}`} className="px-1.5 text-xs text-slate-400">...</span>
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


    {view  && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full min-w-5xl max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Booking Details
        </h2>

        <button
          onClick={() => setview(null)}
          className="rounded-lg p-2 text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          &times;
        </button>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3">

        {/* Room Image */}
        <div className="lg:col-span-1">
          <img
            src={view.roomId.image1}
            alt="Room"
            className="h-72 w-full rounded-xl object-cover"
          />
        </div>

        {/* Booking Details */}
        <div className="space-y-5 lg:col-span-2">

          {/* Guest */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Guest Name
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">
                {view.userId.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Email
              </p>
              <p className="font-semibold text-slate-800 dark:text-white break-all">
                {view.userId.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Phone
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">
                {view.userId.phone}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Guests
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">
                {view.guests}
              </p>
            </div>

          </div>

          {/* Room Details */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Room No
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">
                {view.roomId.roomno}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Room Type
              </p>
              <p className="font-semibold capitalize text-slate-800 dark:text-white">
                {view.roomId.roomtype}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Room Price
              </p>
              <p className="font-semibold text-green-600">
                ₹{view.roomId.price}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Paid
              </p>
              <p className="font-bold text-xl text-indigo-600">
                ₹{view.totalPrice}
              </p>
            </div>

          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Check In
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">
                {new Date(view.checkIn).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Check Out
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">
                {new Date(view.checkOut).toLocaleDateString()}
              </p>
            </div>

          </div>

          {/* Status */}
          <div>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              Booking Status
            </p>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                view.bookingstatus === "confirmed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : view.bookingstatus === "pending"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                  : view.bookingstatus === "cancelled"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {view.bookingstatus}
            </span>
          </div>

          {/* Facilities */}
          <div>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Facilities
            </p>

            <div className="flex flex-wrap gap-2">

              {Object.entries(view.roomId.facilities)
                .filter(([key, value]) => value === true)
                .map(([key]) => (
                  <span
                    key={key}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  >
                    {key}
                  </span>
                ))}

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700">
        <button
          onClick={() => setview(null)}
          className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition hover:bg-indigo-700"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
  
        </div>
  )
}

export default HotelBooking