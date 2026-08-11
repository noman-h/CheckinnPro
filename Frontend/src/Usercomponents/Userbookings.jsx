import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Filter, X, ChevronDown, CalendarDays, RotateCcw } from 'lucide-react'

function Userbookings() {

  const navigate = useNavigate()

  const userId = localStorage.getItem("userid")

  const [bookingdata, setbookingdata] = useState([])
  const [view, setview] = useState(null)
  const [search, setsearch] = useState("")
  const [sort, setsort] = useState("")

  // Date Filter States
  const [dateFilter, setDateFilter] = useState("all") // 'all' | '1week' | '6month' | '1year' | 'custom'
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const token=localStorage.getItem('token')

  async function fetchbooking() {
    try {
      const queryParams = []
      if (dateFilter && dateFilter !== "all") {
        queryParams.push(`range=${dateFilter}`)
      }
      if (dateFilter === "custom") {
        if (customStartDate) queryParams.push(`startDate=${customStartDate}`)
        if (customEndDate) queryParams.push(`endDate=${customEndDate}`)
      }
      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : ""

      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/userbookings/${userId}${queryString}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
      )
      setbookingdata(result?.data?.result || result?.data || [])
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.log(err)
    }
  }

  async function handleview(bookid) {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/bookingview/${bookid}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
      )
      setview(result?.data?.result || result?.data)
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      alert(err)
    }
  }

  async function handlecancel(bookid) {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axios.patch(`${import.meta.env.VITE_API_URL}/booking/bookingcancel/${bookid}`,{},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        alert("Booking cancelled successfully")
        fetchbooking()
      } catch (err) {
         if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
        console.log(err)
        alert(err?.response?.data?.message || "Failed to cancel booking")
      }
    }
  }

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    hotelId: "",
    rating: 0,
    reviewtext: "",
  });

  async function handlereview(bookingItem) {
    setReviewData({
      bookId: bookingItem?._id,
      userId: bookingItem?.userId?._id,    
      roomId: bookingItem?.roomId?._id,
      rating: 0,
      reviewtext: "",
    });

    setReviewModal(true);
  }

  async function submitReview() {
    try {
      if (reviewData.rating === 0) {
        return alert("Please select a rating");
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/review/addreview`,
        { ...reviewData },{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
      );

      alert("Review submitted successfully");

      setReviewModal(false);

      setReviewData({
        hotelId: "",
        rating: 0,
        reviewtext: "",
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
      console.log(err);
      alert("Failed to submit review");
    }
  }

  useEffect(() => {
    if (userId) {
      fetchbooking()
    }
  }, [userId, dateFilter, customStartDate, customEndDate])

  const handleFilterChange = (filterType) => {
    setDateFilter(filterType)
    if (filterType !== 'custom') {
      setShowCustomPicker(false)
    } else {
      setShowCustomPicker(true)
    }
  }

  const resetFilters = () => {
    setDateFilter("all")
    setCustomStartDate("")
    setCustomEndDate("")
    setsearch("")
    setsort("")
    setShowCustomPicker(false)
  }

  const filteredbooking = bookingdata
    .filter((b) => {
      const roomNo = b?.roomId?.roomno?.toString() || ""
      const hotelName = b?.roomId?.hotel_id?.hotelName || ""
      if (search) {
        return (
          roomNo.toLowerCase().includes(search.toLowerCase()) ||
          hotelName.toLowerCase().includes(search.toLowerCase())
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.checkIn) - new Date(a.checkIn)
      if (sort === "oldest") return new Date(a.checkIn) - new Date(b.checkIn)
      return 0
    })

  return (
    <div className="manage-page w-full rounded-xl bg-white p-4 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
      
      {/* Header & Main Controls */}
      <div className="flex w-full flex-col gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back
            </button>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-emerald-500" />
              My Bookings
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search room or hotel..."
              value={search}
              onChange={(e) => setsearch(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900"
            />

            {/* Sort Select */}
            <select
              value={sort}
              onChange={(e) => setsort(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900"
            >
              <option value="">No sorting</option>
              <option value="newest">Newest booking</option>
              <option value="oldest">Oldest booking</option>
            </select>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Date Filter:
              </span>

              {/* Preset Buttons */}
              <button
                onClick={() => handleFilterChange("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  dateFilter === "all"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                All Time
              </button>

              <button
                onClick={() => handleFilterChange("1week")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  dateFilter === "1week"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                1 Week
              </button>

              <button
                onClick={() => handleFilterChange("6month")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  dateFilter === "6month"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                6 Months
              </button>

              <button
                onClick={() => handleFilterChange("1year")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  dateFilter === "1year"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                1 Year
              </button>

              <button
                onClick={() => handleFilterChange("custom")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  dateFilter === "custom"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Custom Range
              </button>
            </div>

            {(dateFilter !== "all" || search || sort || customStartDate || customEndDate) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-500 transition dark:text-slate-400 dark:hover:text-red-400"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
              </button>
            )}
          </div>

          {/* Custom Date Range Picker Drawer */}
          {dateFilter === "custom" && (
            <div className="mt-2 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800/80 transition-all flex flex-col md:flex-row md:items-end gap-4 shadow-sm">
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => {
                      setCustomStartDate("")
                      setCustomEndDate("")
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Summary Badge */}
      <div className="mt-3 px-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredbooking.length}</strong> {filteredbooking.length === 1 ? 'booking' : 'bookings'}
          {dateFilter !== "all" && (
            <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              ({dateFilter === '1week' ? 'Past 1 Week' : dateFilter === '6month' ? 'Past 6 Months' : dateFilter === '1year' ? 'Past 1 Year' : 'Custom Date Range'})
            </span>
          )}
        </span>
      </div>

      {/* Booking List */}
      <div className="flex flex-col gap-4 bg-slate-50 p-4 font-sans text-slate-700 dark:bg-slate-950 dark:text-slate-300">
        {filteredbooking.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No bookings found
          </div>
        ) : (
          filteredbooking.map((item) => {
            const room = item.roomId || {}
            const hotel = room.hotel_id || {}
            const user = item.userId || {}

            return (
              <div
                key={item._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 md:flex-row md:items-center md:justify-between"
              >
                {/* Left Section */}
                <div className="flex flex-col gap-4 w-full">
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

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 md:gap-6">
                    {/* Hotel Details */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Hotel
                      </p>
                      <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm capitalize">
                        {hotel.hotelName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                        {hotel.Address || ""}
                      </p>
                      {(hotel.hotelPhone || hotel.hotelEmail) && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {hotel.hotelPhone} {hotel.hotelEmail ? `• ${hotel.hotelEmail}` : ""}
                        </p>
                      )}
                    </div>

                    {/* Guest */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Guest
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
                        {user.name || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>

                    {/* Dates */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Dates
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        From: {item.checkIn ? item.checkIn.split("T")[0] : "N/A"}
                        <br />
                        To: {item.checkOut ? item.checkOut.split("T")[0] : "N/A"}
                      </p>
                    </div>

                    {/* Total Price */}
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

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 md:pt-0">
                  <button
                    onClick={() => handleview(item._id)}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-950/40"
                  >
                    View
                  </button>

                  {(item.bookingstatus === "pending" || item.bookingstatus === "active") && (
                    <button
                      onClick={() => handlecancel(item._id)}
                      className="rounded-lg px-4 py-2 text-sm font-semibold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 shadow-sm"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {item.bookingstatus === "completed" && (
                    <button
                      onClick={() => handlereview(item)}
                      disabled={item.bookingreview}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2
                        ${
                          item.bookingreview
                            ? "cursor-not-allowed border border-green-300 bg-green-500 focus:ring-green-400 dark:border-green-600 dark:bg-green-600"
                            : "border border-amber-300 bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 dark:border-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
                        }`}
                    >
                      {item.bookingreview ? "Reviewed" : "Add Review"}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Write a Review
              </h2>

              <button
                onClick={() => setReviewModal(false)}
                className="text-2xl text-slate-500 hover:text-red-500"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                Rate your experience
              </p>

              {/* Rating */}
              <div className="mb-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setReviewData({
                        ...reviewData,
                        rating: star
                      })
                    }
                    className="transition hover:scale-125"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={star <= reviewData.rating ? "#facc15" : "none"}
                      viewBox="0 0 24 24"
                      stroke="#facc15"
                      className="h-10 w-10"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.386a.562.562 0 01-.84.61L12 17.77l-4.72 2.77a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557L3.34 10.385a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Review Text */}
              <textarea
                rows={5}
                placeholder="Share your experience..."
                value={reviewData.reviewtext}
                onChange={(e) =>
                  setReviewData({
                    ...reviewData,
                    reviewtext: e.target.value
                  })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
              <button
                onClick={() => setReviewModal(false)}
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-5 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={submitReview}
                className="rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2 font-semibold text-white"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">
                Booking Details
              </h2>

              <button
                onClick={() => setview(null)}
                className="rounded-lg p-1.5 text-xl sm:text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
              >
                &times;
              </button>
            </div>

            <div className="grid gap-6 p-4 sm:p-6 grid-cols-1 lg:grid-cols-3">
              {/* Room Image */}
              <div className="lg:col-span-1">
                <img
                  src={view.roomId?.image1 || "https://via.placeholder.com/300"}
                  alt="Room"
                  className="h-48 sm:h-60 lg:h-72 w-full rounded-xl object-cover shadow-sm"
                />
              </div>

              {/* Booking Details */}
              <div className="space-y-5 lg:col-span-2">
                {/* Guest Details */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Guest Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Guest Name
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">
                        {view.userId?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Email
                      </p>
                      <p className="break-all font-semibold text-slate-800 dark:text-white text-sm">
                        {view.userId?.email || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Phone
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">
                        {view.userId?.phone || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total Guests
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">
                        {view.guests}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Room & Payment Details */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Room & Payment
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Room No
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">
                        {view.roomId?.roomno || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Room Type
                      </p>
                      <p className="font-semibold capitalize text-slate-800 dark:text-white text-sm">
                        {view.roomId?.roomtype || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Room Price
                      </p>
                      <p className="font-semibold text-emerald-600 text-sm">
                        ₹{view.roomId?.price}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total Paid
                      </p>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        ₹{view.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Dates */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Reservation Dates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Check In Date
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">
                        {new Date(view.checkIn).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Check Out Date
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">
                        {new Date(view.checkOut).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Booking Status
                    </p>
                  </div>

                  <span
                    className={`inline-block w-fit rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${
                      view.bookingstatus === "completed"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
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
                {view.roomId?.facilities && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Facilities Included
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {Object.entries(view.roomId.facilities)
                        .filter(([key, value]) => value === true)
                        .map(([key]) => (
                          <span
                            key={key}
                            className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 px-3 py-1 text-xs font-medium capitalize text-indigo-700 dark:text-indigo-300"
                          >
                            {key}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 rounded-b-2xl">
              {(view.bookingstatus === "pending" || view.bookingstatus === "active") && (
                <button
                  onClick={() => {
                    handlecancel(view._id)
                    setview(null)
                  }}
                  className="w-full sm:w-auto rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 transition shadow-sm"
                >
                  Cancel Booking
                </button>
              )}
              <button
                onClick={() => setview(null)}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Userbookings