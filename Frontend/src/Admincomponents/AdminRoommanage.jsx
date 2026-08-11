import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import UseDebouncing from '../Hooks/UseDebouncing'
import { Download } from 'lucide-react'

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

  const [hoteldata, sethoteldata] = useState([]);
  const [bulkImportPopup, setBulkImportPopup] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkHotelId, setBulkHotelId] = useState("");

  const token=localStorage.getItem('token')
    
      async function fetchhotels() {
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/hotel/getalladminhotelsopt/${adminemail}`,{
          headers: { Authorization: `Bearer ${token}` },
        }
          );
           
          sethoteldata(result?.data?.response || []);
        } catch (err) {
          console.log(err.response);
        }
      }
      
  async function fetchrooms() {
    try {
      const skip = (page - 1) * limit;

      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/room/getalladminhotelrooms/${adminemail}?search=${debouncedvalue}&status=${status}&sort=${sort}&skip=${skip}&limit=${limit}`,{
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // Accepts total & totalPages from API response, or provides client-side fallbacks
      const responseData = result?.data?.response || []
      setroomdata(responseData)

      const totalCount = result?.data?.totalCount || result?.data?.total || responseData.length
      const computedTotalPages = Math.ceil(totalCount / limit) || 1

      setTotalData(totalCount)
      setTotalPages(computedTotalPages)
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

  async function handledeactivate(id) {
    try {
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/room/softdeleteroom/${id}`,{},{
          headers: { Authorization: `Bearer ${token}` },
        })
      if (result.status === 200) {
        fetchrooms()
      }
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

  async function handlerestore(id) {
    try {
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/room/recoverdeleteroom/${id}`,{},{
          headers: { Authorization: `Bearer ${token}` },
        })
      if (result.status === 200) {
        fetchrooms()
      }
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

  async function handledelete(id) {
    try {
      const result = await axios.delete(`${import.meta.env.VITE_API_URL}/room/deleteroom/${id}`,{
          headers: { Authorization: `Bearer ${token}` },
        })
      if (result.status === 200) {
        fetchrooms()
      }
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

  const [view, setview] = useState(null)

  async function handleview(id) {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/room/getoneroom/${id}`,{
          headers: { Authorization: `Bearer ${token}` },
        })
      setview(result?.data?.response)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(()=>{
  fetchhotels()
  },[])
  // Reset page to 1 whenever search, sort, status or limit changes
  useEffect(() => {
    setPage(1)
  }, [debouncedvalue, sort, status, limit])

  useEffect(() => {
    fetchrooms()
  }, [debouncedvalue, sort, status, page, limit])

  function hoteloptions() {
    return hoteldata.map((h) => <option key={h._id} value={h._id}>{h.hotelName}</option>)
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/download/pdf`,
        { pdfdata: roomdata },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rooms.pdf');
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
      console.error('Error downloading PDF:edit', error);
    }
  };

  async function handleBulkImport(e) {
  e.preventDefault();

  if (!bulkHotelId) {
    alert("Please select a hotel first.");
    return;
  }

  if (!bulkFile) {
    alert("Please select an Excel file to upload.");
    return;
  }

  const formData = new FormData();

  formData.append("hotel_id", bulkHotelId);
  formData.append("file", bulkFile);

  try {
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/room/bulkimport`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (result.status === 200) {
      alert(
        `Import completed!\nImported: ${result.data.imported}\nErrors: ${result.data.errors?.length || 0}`
      );

      setBulkImportPopup(false);
      setBulkFile(null);
      setBulkHotelId("");

      fetchrooms();
    }

  } catch (err) {

    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("userid");
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("theme");

      navigate("/login");
      return;
    }

    alert(
      "Error importing rooms: " +
      (err.response?.data?.message || err.message)
    );

    console.log(err);
  }
}


  return (
    <div className="manage-page overflow-x-hidden w-full rounded-xl bg-white p-3 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
      
      <div className="flex w-full flex-col gap-3 pb-3">
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
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:max-w-xs"
          />

          <select
            value={sort}
            onChange={(e) => setsort(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:flex-none"
          >
            <option value="">No sorting</option>
            {hoteloptions()}
          </select>
        </div>

        <div className="flex gap-3 justify-start sm:justify-end">
           <button onClick={handleDownloadPDF} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2">
                <Download className="h-4 w-4" /> PDF
              </button>
          <button
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => setBulkImportPopup(true)}
          >
            Bulk Import Excel
          </button>
          <button
            className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => navigate('/roomaddform')}
          >
            + Add room
          </button>
        </div>
      </div>

      {/* Main Content List */}
      {roomdata.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-slate-400 dark:border-slate-700">
          No Rooms Found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomdata.map((room) => (
            <div
              key={room._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                {room.image1 ? (
                  <LazyLoadImage
                    src={room.image1}
                    alt={`Room ${room.roomno}`}
                    effect="blur"
                    className="h-48 w-full object-cover"
                    wrapperClassName="h-48 w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    No Image
                  </div>
                )}
                
                {/* Hotel Badge */}
                <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-200">
                  {room.hotel_id?.hotelName || "Unknown Hotel"}
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {room.roomtype} - {room.roomno}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        ₹{room.price} / night
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        room.isavailable
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {room.isavailable ? "Available" : "Booked"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Max Guests</p>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {room.facilities?.maxguests || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Bed Type</p>
                      <p className="font-medium capitalize text-slate-700 dark:text-slate-300">
                        {room.facilities?.bedtype || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-2 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    onClick={() => handleview(room._id)}
                    className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-600 transition hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20"
                  >
                    View
                  </button>

                  <button
                    onClick={() => navigate(`/roomaddform/${room._id}`)}
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                  >
                    Edit
                  </button>

                  {room.activestatus ? (
                    <>
                      <button
                        onClick={() => handledeactivate(room._id)}
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-600 transition hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                      >
                        Deactivate
                      </button>

                      <button
                        onClick={() => handledelete(room._id)}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handlerestore(room._id)}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                      >
                        Restore
                      </button>

                      <button
                        onClick={() => handledelete(room._id)}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
        <div className="flex flex-wrap items-center justify-center gap-1.5">
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

      {bulkImportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Bulk Import Rooms</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload an Excel sheet to bulk import rooms.</p>
              </div>
              <button type="button" onClick={() => { setBulkImportPopup(false); setBulkFile(null); setBulkHotelId(""); }} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800">
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Hotel</label>
                  <select value={bulkHotelId} onChange={(e) => setBulkHotelId(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <option value="">Select a hotel...</option>
                    {hoteloptions()}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Excel File (.xlsx)</label>
                  <input type="file" accept=".xlsx, .xls" onChange={(e) => setBulkFile(e.target.files[0])} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
                <button type="button" onClick={() => { setBulkImportPopup(false); setBulkFile(null); setBulkHotelId(""); }} className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-2.5 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                  Import Rooms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminRoommanage