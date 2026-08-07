import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import UseDebouncing from '../Hooks/UseDebouncing';

function HotelRoommanage() {

    const navigate=useNavigate()

    const [search,setsearch]=useState("")
    const [status, setstatus] = useState("active");
    const debouncedvalue=UseDebouncing(search,1000)

     const [roomdata, setroomdata] = useState([]);

     const hotelEmail=localStorage.getItem("email")

    
      async function fetchrooms() {
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/room/getallhotelrooms/${hotelEmail}?search=${search}&&status=${status}`,
          );
    
          setroomdata(result?.data?.response || []);
        } catch (err) {
          console.log(err);
        }
      }
      console.log(roomdata);

    async function handledeactivate(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/room/softdeleteroom/${id}`)

             if(result.status===200){
                fetchrooms()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handlerestore(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/room/recoverdeleteroom/${id}`)

             if(result.status===200){
                fetchrooms()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handledelete(id){
           try{
              const result=await axios.delete(`${import.meta.env.VITE_API_URL}/room/deleteroom/${id}`)

             if(result.status===200){
                fetchrooms()
             }
           }
           catch(err){
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
     
      useEffect(()=>{
        fetchrooms()
      },[debouncedvalue,status])


   
   
  return (
     <div className="manage-page w-full rounded-xl bg-white p-3 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
          <div className="w-full flex justify-between items-center pb-3">
            <div className="flex gap-2">
            
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:max-w-xs"
              />
              
            </div>
             <button
              className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() =>navigate('/roomaddform')}
            >
              + Add Room
            </button>
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
