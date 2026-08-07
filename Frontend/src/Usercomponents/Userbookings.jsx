import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Userbookings() {

  const navigate = useNavigate()

  const userId = localStorage.getItem("userid")

  const [bookingdata, setbookingdata] = useState([])
  const [view, setview] = useState(null)
  const [search, setsearch] = useState("")
  const [sort, setsort] = useState("")

  async function fetchbooking() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/userbookings/${userId}`
      )
      setbookingdata(result?.data?.result || result?.data || [])
    } catch (err) {
      console.log(err)
    }
  }

  async function handleview(bookid) {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/bookingview/${bookid}`
      )
      setview(result?.data?.result || result?.data)
    } catch (err) {
      alert(err)
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
        { ...reviewData }
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
      console.log(err);
      alert("Failed to submit review");
    }
  }

  useEffect(() => {
    if (userId) {
      fetchbooking()
    }
  }, [userId])

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
    <div className="manage-page w-full rounded-xl bg-white p-3 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
      
      {/* Header & Controls */}
      <div className="flex w-full flex-col gap-3 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by room or hotel name..."
            value={search}
            onChange={(e) => setsearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:max-w-xs"
          />

          {/* Sort Select */}
          <select
            value={sort}
            onChange={(e) => setsort(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
          >
            <option value="">No sorting</option>
            <option value="newest">Newest booking</option>
            <option value="oldest">Oldest booking</option>
          </select>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-7xl min-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
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
                  src={view.roomId?.image1 || "https://via.placeholder.com/300"}
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
                      {view.userId?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Email
                    </p>
                    <p className="break-all font-semibold text-slate-800 dark:text-white">
                      {view.userId?.email || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Phone
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {view.userId?.phone || "N/A"}
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
                      {view.roomId?.roomno || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Room Type
                    </p>
                    <p className="font-semibold capitalize text-slate-800 dark:text-white">
                      {view.roomId?.roomtype || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Room Price
                    </p>
                    <p className="font-semibold text-green-600">
                      ₹{view.roomId?.price}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total Paid
                    </p>
                    <p className="text-xl font-bold text-indigo-600">
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
                    className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
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
                    <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                      Facilities
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {Object.entries(view.roomId.facilities)
                        .filter(([key, value]) => value === true)
                        .map(([key]) => (
                          <span
                            key={key}
                            className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium capitalize text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
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

export default Userbookings