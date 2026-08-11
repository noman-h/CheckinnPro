import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import UseDebouncing from '../Hooks/UseDebouncing';
import { Download } from 'lucide-react';

function HotelRoommanage() {

    const navigate=useNavigate()

    const [search,setsearch]=useState("")
    const [status, setstatus] = useState("active");
    const debouncedvalue=UseDebouncing(search,1000)

     const [roomdata, setroomdata] = useState([]);

     // --- PAGINATION STATES ---
     const [currentPage, setCurrentPage] = useState(1);
     const [limit, setLimit] = useState(6);
     const [totalPages, setTotalPages] = useState(1);
     const [totalRooms, setTotalRooms] = useState(0);

     const hotelEmail=localStorage.getItem("email")
     const token=localStorage.getItem('token')
    
      async function fetchrooms() {
        try {
          const skip = (currentPage - 1) * limit;
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/room/getallhotelrooms/${hotelEmail}?search=${debouncedvalue}&status=${status}&skip=${skip}&limit=${limit}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
          );

          const responseData = result?.data?.response || [];
          setroomdata(responseData);

          const count = result?.data?.totalcount ?? responseData.length;
          setTotalRooms(count);
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
          console.log(err);
        }
      }


    async function handledeactivate(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/room/softdeleteroom/${id}`,{},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

             if(result.status===200){
                fetchrooms()
             }
           }
           catch(err){
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

      async function handlerestore(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/room/recoverdeleteroom/${id}`,{},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

             if(result.status===200){
                fetchrooms()
             }
           }
           catch(err){
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

      async function handledelete(id){
           try{
              const result=await axios.delete(`${import.meta.env.VITE_API_URL}/room/deleteroom/${id}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

             if(result.status===200){
                fetchrooms()
             }
           }
           catch(err){
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


     const [view,setview]=useState(null)

     async function handleview(id){
        try{
           const result=await axios.get(`${import.meta.env.VITE_API_URL}/room/getoneroom/${id}`)

           setview(result?.data?.response)
        }
        catch(err){
          console.log(err);
          
        }
     }
     
      // Reset to page 1 when filters change
      useEffect(() => {
        setCurrentPage(1);
      }, [debouncedvalue, status]);

      useEffect(()=>{
        fetchrooms()
      },[debouncedvalue, status, currentPage, limit])

      const getPageNumbers = useMemo(() => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
          for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
          if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
          else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages-3, totalPages-2, totalPages-1, totalPages);
          else pages.push(1, '...', currentPage-1, currentPage, currentPage+1, '...', totalPages);
        }
        return pages;
      }, [currentPage, totalPages]);

      const startItem = totalRooms === 0 ? 0 : (currentPage - 1) * limit + 1;
      const endItem = Math.min(currentPage * limit, totalRooms);


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
      console.error('Error downloading PDF:', error);
    }
  };
   
   
  return (
     <div className="manage-page w-full p-3 text-slate-800 dark:text-slate-100">
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
                placeholder="Search room..."
                value={search}
                onChange={(e) => setsearch(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:max-w-xs"
              />
            </div>

            <div className="flex gap-3 justify-start sm:justify-end">
               <button onClick={handleDownloadPDF} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2">
                <Download className="h-4 w-4" /> PDF
              </button>
              <button
                className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={() =>navigate('/roomaddform')}
              >
                + Add Room
              </button>
            </div>
          </div>

          
          <div className="space-y-4">
  {roomdata.length === 0 ? (
    <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-400 dark:border-slate-700">
      No rooms found
    </div>
  ) : (
    roomdata.map((item) => (
      <div
        key={item._id}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Left */}
          <div className="flex gap-4">
            <img
              src={item.image1}
              alt={`Room ${item.roomno}`}
              loading="lazy"
              decoding="async"
              className="h-28 w-36 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
            />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Room {item.roomno}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.activestatus
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {item.activestatus ? "Active" : "Inactive"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.isavailable
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  }`}
                >
                  {item.isavailable ? "Available" : "Booked"}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
               
                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Type:</span>{" "}
                  {item.roomtype}
                </p>

                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Price:</span> ₹{item.price}
                </p>

                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Guests:</span>{" "}
                  {item?.facilities?.maxguests}
                </p>

                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Bed:</span>{" "}
                  {item?.facilities?.bedtype}
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button
              onClick={() => handleview(item._id)}
              className="rounded-md px-3 py-1.5 text-sky-600 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-800"
            >
              View
            </button>

            {status === "active" ? (
              <>
                <button
                  onClick={() => {
                    setpopup("roomadd");
                    setroom(item);
                  }}
                  className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  Edit
                </button>

                <button
                  onClick={() => handledeactivate(item._id)}
                  className="rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  Deactivate
                </button>

                <button
                  onClick={() => handledelete(item._id)}
                  className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handlerestore(item._id)}
                  className="rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                >
                  Restore
                </button>

                <button
                  onClick={() => handledelete(item._id)}
                  className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    ))
  )}
</div>

{/* --- PAGINATION CONTROLS --- */}
{totalRooms > 0 && (
  <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
      <span>
        Showing <strong className="text-slate-900 dark:text-white">{startItem}</strong> to{" "}
        <strong className="text-slate-900 dark:text-white">{endItem}</strong> of{" "}
        <strong className="text-slate-900 dark:text-white">{totalRooms}</strong> rooms
      </span>
      <div className="flex items-center gap-1.5">
        <label className="text-xs">Show:</label>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value={4}>4</option>
          <option value={6}>6</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        onClick={() => setCurrentPage(p => Math.max(p-1,1))}
        disabled={currentPage===1}
        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >Previous</button>
      <div className="flex items-center gap-1">
        {getPageNumbers.map((p,idx) =>
          p==='...' ? (
            <span key={`d${idx}`} className="px-1.5 text-xs text-slate-400">...</span>
          ) : (
            <button key={p} onClick={()=>setCurrentPage(p)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                currentPage===p ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}>{p}</button>
          )
        )}
      </div>
      <button
        onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))}
        disabled={currentPage===totalPages}
        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >Next</button>
    </div>
  </div>
)}



{/* view model */}
{view && (
  <div className="room-details-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div className="room-details-card w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

      {/* Header */}
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
          onClick={() => setview("")}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          ✕
        </button>
      </div>

      <div className="room-details-content space-y-6 p-6">

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
                    view?.facilities[key]
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {view?.facilities[key] ? "Yes" : "No"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
          <h3 className="mb-5 text-lg font-semibold text-slate-800 dark:text-white">
            Room Images
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[view.image1, view.image2, view.image3, view.image4, view.image5]
              .filter(Boolean)
              .map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Room ${index + 1}`}
                  className="h-32 w-full rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                />
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700">
        <button
          onClick={() => setview("")}
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

export default HotelRoommanage
