import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import UseDebouncing from '../Hooks/UseDebouncing'

function AdminRoommanage() {
  const [search, setsearch] = useState("")
  const [sort, setsort] = useState("")
  const [status, setstatus] = useState("active")
  const debouncedvalue = UseDebouncing(search, 1000)

  // Pagination States
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [totalPages, setTotalPages] = useState(1)
  const [totalData, setTotalData] = useState(0)

  const navigate = useNavigate()
  const adminemail = localStorage.getItem('email')
  const [roomdata, setroomdata] = useState([])

  async function fetchrooms() {
    try {
      const skip = (page - 1) * limit;

      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/room/getalladminhotelrooms/${adminemail}?search=${debouncedvalue}&status=${status}&sort=${sort}&skip=${skip}&limit=${limit}`
      )

      // Accepts total & totalPages from API response, or provides client-side fallbacks
      const responseData = result?.data?.response || []
      setroomdata(responseData)

      const totalCount = result?.data?.totalCount || result?.data?.total || responseData.length
      const computedTotalPages = Math.ceil(totalCount / limit) || 1

      setTotalData(totalCount)
      setTotalPages(computedTotalPages)
    } catch (err) {
      console.log(err)
    }
  }

  async function handledeactivate(id) {
    try {
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/room/softdeleteroom/${id}`)
      if (result.status === 200) {
        fetchrooms()
      }
    } catch (err) {
      console.log(err)
    }
  }

  async function handlerestore(id) {
    try {
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/room/recoverdeleteroom/${id}`)
      if (result.status === 200) {
        fetchrooms()
      }
    } catch (err) {
      console.log(err)
    }
  }

  async function handledelete(id) {
    try {
      const result = await axios.delete(`${import.meta.env.VITE_API_URL}/room/deleteroom/${id}`)
      if (result.status === 200) {
        fetchrooms()
      }
    } catch (err) {
      console.log(err)
    }
  }

  const [view, setview] = useState(null)

  async function handleview(id) {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/room/getoneroom/${id}`)
      setview(result?.data?.response)
    } catch (err) {
      console.log(err)
    }
  }

  // Reset page to 1 whenever search, sort, status or limit changes
  useEffect(() => {
    setPage(1)
  }, [debouncedvalue, sort, status, limit])

  useEffect(() => {
    fetchrooms()
  }, [debouncedvalue, sort, status, page, limit])

  function hoteloptions() {
    return roomdata.map((h) => <option key={h._id} value={h._id}>{h.hotelName}</option>)
  }

  return (
    <div className="manage-page overflow-y-scroll scrollbar-none h-screen w-full rounded-xl bg-white p-3 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
      
      {/* Search & Action Controls Header */}
      <div className="flex w-full flex-col gap-3 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              status === "active"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
            onClick={() => setstatus("active")}
          >
            Active
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              status === "inactive"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
            onClick={() => setstatus("inactive")}
          >
            Inactive
          </button>

          <input
            type="text"
            placeholder="Search hotels..."
            value={search}
            onChange={(e) => setsearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:max-w-xs"
          />

          <select
            value={sort}
            onChange={(e) => setsort(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
          >
            <option value="">No sorting</option>
            {hoteloptions()}
          </select>
        </div>

        <button
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => navigate('/roomaddform')}
        >
          + Add room
        </button>
      </div>

      {/* Main Content List */}
      {roomdata.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-slate-400 dark:border-slate-700">
          No Rooms Found
        </div>
      ) : (
        <div className="space-y-8">
          {roomdata.map((hotel) => {
            const roomsdata = hotel.roomarray || []
            return (
              <div
                key={hotel._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {/* Hotel Header */}
                <div className="flex flex-col gap-5 border-b border-slate-200 p-6 dark:border-slate-700 md:flex-row">
                  <LazyLoadImage
                    src={hotel.images}
                    alt={hotel.hotelName}
                    effect="blur"
                    className="h-52 w-full rounded-xl object-cover md:h-44 md:w-72"
                    wrapperClassName="h-52 w-full md:h-44 md:w-72"
                  />

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {hotel.hotelName}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          hotel.approveStatus === "approved"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : hotel.approveStatus === "pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {hotel.approveStatus}
                      </span>
                    </div>

                    <p className="mt-3 text-slate-600 dark:text-slate-400">
                      {hotel.description}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-400">Address</p>
                        <p className="font-medium dark:text-white">{hotel.Address}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="font-medium dark:text-white">
                          {hotel.hotelEmail}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Phone</p>
                        <p className="font-medium dark:text-white">
                          {hotel.hotelPhone}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Rooms</p>
                        <p className="font-medium dark:text-white">
                          {roomsdata.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rooms Grid */}
                <div className="p-6">
                  <h3 className="mb-5 text-lg font-semibold text-slate-800 dark:text-white">
                    Rooms
                  </h3>

                  {roomsdata.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-slate-400 dark:border-slate-700">
                      No Rooms Added
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {roomsdata.map((room) => (
                        <div
                          key={room._id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                        >
                          <LazyLoadImage
                            src={room.image1}
                            alt={`Room ${room.roomno}`}
                            effect="blur"
                            className="h-44 w-full rounded-lg object-cover"
                            wrapperClassName="mb-4 h-44 w-full"
                          />

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Room No</span>
                              <span className="font-semibold dark:text-white">
                                {room.roomno}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">Type</span>
                              <span className="capitalize dark:text-white">
                                {room.roomtype}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">Price</span>
                              <span className="font-semibold dark:text-white">
                                ₹{room.price}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">Guests</span>
                              <span className="dark:text-white">
                                {room.facilities?.maxguests}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">Availability</span>

                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  room.isavailable
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                }`}
                              >
                                {room.isavailable ? "Available" : "Booked"}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-5 flex flex-wrap gap-2">
                            <button
                              onClick={() => handleview(room._id)}
                              className="rounded-lg px-3 py-2 text-sky-600 hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-slate-700"
                            >
                              View
                            </button>

                            <button
                              onClick={() => typeof handleRoomEdit === 'function' && handleRoomEdit(room)}
                              className="rounded-lg bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              Edit
                            </button>

                            {room.activestatus ? (
                              <>
                                <button
                                  onClick={() => handledeactivate(room._id)}
                                  className="rounded-lg bg-amber-100 px-3 py-2 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                                >
                                  Deactivate
                                </button>

                                <button
                                  onClick={() => handledelete(room._id)}
                                  className="rounded-lg bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handlerestore(room._id)}
                                  className="rounded-lg bg-green-100 px-3 py-2 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                                >
                                  Restore
                                </button>

                                <button
                                  onClick={() => handledelete(room._id)}
                                  className="rounded-lg bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls Section */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
        
        {/* Left Side: Items Count & Items per page Selector */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{(page - 1) * limit + 1}</strong> to{" "}
            <strong className="text-slate-900 dark:text-white">{Math.min(page * limit, totalData)}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white">{totalData}</strong> entries
          </span>

          <div className="flex items-center gap-1.5">
            <label htmlFor="limit-select">Show:</label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                page === pageNum
                  ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                  : "border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>

      {/* View Modal */}
      {view && (
        <div className="room-details-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="room-details-card w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Room Details
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  View room information
                </p>
              </div>

              <button
                onClick={() => setview(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="room-details-content max-h-[80vh] overflow-y-auto space-y-6 p-6">
              {/* Basic Information */}
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="mb-5 text-lg font-semibold text-slate-800 dark:text-white">
                  Basic Information
                </h3>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Room Number
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {view.roomno}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Room Type
                    </p>
                    <p className="font-semibold capitalize text-slate-800 dark:text-white">
                      {view.roomtype}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Price
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      ₹{view.price}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Availability
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        view.isavailable
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {view.isavailable ? "Available" : "Booked"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Status
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        view.activestatus
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {view.activestatus ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hotel Information */}
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="mb-5 text-lg font-semibold text-slate-800 dark:text-white">
                  Hotel Information
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Hotel Name
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {view?.hotel_id?.hotelName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Address
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      {view?.hotel_id?.Address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="mb-5 text-lg font-semibold text-slate-800 dark:text-white">
                  Facilities
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Max Guests
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {view?.facilities?.maxguests}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Bed Type
                    </span>
                    <p className="font-semibold capitalize text-slate-800 dark:text-white">
                      {view?.facilities?.bedtype?.replace("bed", " Bed")}
                    </p>
                  </div>

                  {[
                    "wifi",
                    "ac",
                    "tv",
                    "minibar",
                    "breakfastincluded",
                    "parking",
                    "roomservice",
                    "laundry",
                    "balcony",
                    "smokingAllowed",
                  ].map((key) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
                    >
                      <span className="capitalize text-slate-700 dark:text-slate-300">
                        {key
                          .replace("breakfastincluded", "Breakfast")
                          .replace("roomservice", "Room Service")
                          .replace("smokingAllowed", "Smoking")
                          .replace("minibar", "Mini Bar")}
                      </span>

                      <span
                        className={`text-sm font-semibold ${
                          view?.facilities?.[key]
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        {view?.facilities?.[key] ? "Yes" : "No"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Images */}
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="mb-5 text-lg font-semibold text-slate-800 dark:text-white">
                  Room Images
                </h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                  {[view.image1, view.image2, view.image3, view.image4, view.image5]
                    .filter(Boolean)
                    .map((img, index) => (
                      <LazyLoadImage
                        key={index}
                        src={img}
                        alt={`Room View ${index + 1}`}
                        effect="blur"
                        className="h-32 w-full rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                        wrapperClassName="h-32 w-full"
                      />
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700">
              <button
                onClick={() => setview(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
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

export default AdminRoommanage