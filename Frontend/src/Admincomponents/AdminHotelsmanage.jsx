import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import UseDebouncing from '../Hooks/UseDebouncing';

function AdminHotelsmanage() {

    const navigate=useNavigate()

    const [status, setstatus] = useState("active");
    const [search, setsearch] = useState("");
    const [sort, setsort] = useState("");

    const debouncedvalue=UseDebouncing(search,1000)
    
    const [popup, setpopup] = useState("");

    const [hoteldata, sethoteldata] = useState([]);
    const adminemail=localStorage.getItem("email")
    
    
      async function fetchhotels() {
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/hotel/getalladminhotels/${adminemail}?search=${search}&&sort=${sort}&&status=${status}`,
          );
    
          sethoteldata(result?.data?.response || []);
        } catch (err) {
          console.log(err.response);
        }
      }
    

  async function handledeactivate(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/softdeletehotel/${id}`)

             if(result.status===200){
                fetchhotels()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handlerestore(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/recoverdeletehotel/${id}`)

             if(result.status===200){
                fetchhotels()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handledelete(id){
           try{
              const result=await axios.delete(`${import.meta.env.VITE_API_URL}/hotel/deletehotel/${id}`)

             if(result.status===200){
                fetchhotels()
             }
           }
           catch(err){
             console.log(err)
           }
      }


     const [view,setview]=useState(null)

     async function handleview(id){
        try{
           const result=await axios.get(`${import.meta.env.VITE_API_URL}/hotel/getonehotel/${id}`)

           setview(result?.data?.response)
        }
        catch(err){
          console.log(err);
          
        }
     }
     

      useEffect(()=>{
         fetchhotels()
      },[debouncedvalue,sort,status])

    // states filtered by their own activestatus
  const filteredhotel = hoteldata
  
  console.log(hoteldata);
  

  
  return (
   <div className="manage-page w-full rounded-xl bg-white p-3 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
          <div className="flex w-full flex-col gap-3 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex  gap-2">
            
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
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              
            </div>
             <button
              className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() =>navigate('/hotelform')}
            >
              + Add Hotel
            </button>
          </div>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
  {filteredhotel.length === 0 ? (
    <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-400 dark:border-slate-700">
      No hotels found
    </div>
  ) : (
    filteredhotel.map((item) => (
      <div
        key={item._id}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex flex-col md:flex-row">

          {/* Hotel Image */}
          <div className="md:w-64">
            <img
              src={item.images}
              alt={item.hotelName}
              className="h-60 w-full object-cover md:h-full"
            />
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col justify-between p-5">

            <div>

              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {item.hotelName}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.approveStatus === "approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : item.approveStatus === "pending"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {item.approveStatus}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {item.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">

                <div>
                  <p className="text-slate-400">Address</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {item.Address}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">City</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {item.CityId?.cityname}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Email</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 break-all">
                    {item.hotelEmail}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Phone</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {item.hotelPhone}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Price / Night</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    ₹{item.pricePerNight}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Rooms</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {item.totalRooms}
                  </p>
                </div>

              </div>

              <div className="mt-5">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.activeStatus
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {item.activeStatus ? "Active" : "Inactive"}
                </span>
              </div>

            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-wrap gap-2">

              <button
                onClick={() => handleview(item._id)}
                className="rounded-lg px-4 py-2 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-800"
              >
                View
              </button>

              {item.activeStatus ? (
                <>
                  <button
                    onClick={() => handledeactivate(item._id)}
                    className="rounded-lg bg-amber-50 px-4 py-2 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
                  >
                    Deactivate
                  </button>

                  <button
                    onClick={() => handledelete(item._id)}
                    className="rounded-lg bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                  >
                    Delete
                  </button>
                </>
              ) : (
                item.approveStatus === "approved" && (
                  <>
                    <button
                      onClick={() => handlerestore(item._id)}
                      className="rounded-lg bg-emerald-50 px-4 py-2 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                    >
                      Restore
                    </button>

                    <button
                      onClick={() => handledelete(item._id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </>
                )
              )}

            </div>

          </div>
        </div>
      </div>
    ))
  )}
</div>
         

          {view && (
  <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full min-w-5xl max-h-[90vh] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-scroll scrollbar-thin scrollbar-thumb-sky-400 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          View Hotel
        </h2>

        <button
          onClick={() => setview(null)}
          className="text-2xl text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hotel Name
            </p>
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {view.hotelName}
            </p>
          </div>

          <div>
  <p className="text-sm text-slate-500 dark:text-slate-400">
    Hotel Owner
  </p>
  <p className="font-semibold text-slate-800 dark:text-slate-100">
    {view.admin_id?.ownername}
  </p>
</div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Email
            </p>
            <p className="text-slate-800 dark:text-slate-100">
              {view.hotelEmail}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Phone
            </p>
            <p className="text-slate-800 dark:text-slate-100">
              {view.hotelPhone}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Price / Night
            </p>
            <p className="text-slate-800 dark:text-slate-100">
              ₹ {view.pricePerNight}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Rooms
            </p>
            <p className="text-slate-800 dark:text-slate-100">
              {view.totalRooms}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              City
            </p>
            <p className="text-slate-800 dark:text-slate-100">
              {view.CityId?.cityname}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Approval Status
            </p>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                view.approveStatus === "approved"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : view.approveStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              }`}
            >
              {view.approveStatus}
            </span>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Active Status
            </p>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                view.activeStatus
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              }`}
            >
              {view.activeStatus ? "Active" : "Inactive"}
            </span>
          </div>

        </div>
        
        {/* hotel image */}
        <div>
  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
    Hotel Image
  </p>

  <img
    src={view.images}
    alt={view.hotelName}
    className="w-full md:w-80 h-56 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow"
  />
</div>

        {/* Address */}
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Address
          </p>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-200">
            {view.Address}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Description
          </p>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-200">
            {view.description}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Created At
            </p>

            <p className="text-slate-800 dark:text-slate-100">
              {new Date(view.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Updated At
            </p>

            <p className="text-slate-800 dark:text-slate-100">
              {new Date(view.updatedAt).toLocaleString()}
            </p>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-700">

        <button
          onClick={() => setview(null)}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 transition"
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

export default AdminHotelsmanage
