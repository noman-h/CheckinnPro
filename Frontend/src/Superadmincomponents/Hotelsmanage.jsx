import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UseDebouncing from '../Hooks/UseDebouncing';
import { Download } from 'lucide-react';

function Hotelsmanage() {

  const navigate = useNavigate()
  const [status, setstatus] = useState("pending"); // Defaulting to pending to match Superadmin initial tab
  const [search, setsearch] = useState("");
  const [sort, setsort] = useState("");

  const debouncedsearch = UseDebouncing(search, 1000);

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);

  const [hoteldata, sethoteldata] = useState([]);

  const token=localStorage.getItem('token')

  async function fetchhotels() {
    try {
      const skip = (currentPage - 1) * limit;
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/hotel/getallhotels?search=${debouncedsearch}&sort=${sort}&status=${status}&skip=${skip}&limit=${limit}`,
      );

      const responseData = result?.data?.response || [];
      sethoteldata(responseData);

      const count = result?.data?.totalcount ?? responseData.length;
      setTotalHotels(count);
      setTotalPages(Math.ceil(count / limit) || 1);
    } catch (err) {
      console.log(err);
    }
  }


  async function handledeactivate(id) {
    try {
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/softdeletehotel/${id}`,{},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

      if (result.status === 200) {
        fetchhotels()
      }
    }
    catch (err) {
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
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/recoverdeletehotel/${id}`,{},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

      if (result.status === 200) {
        fetchhotels()
      }
    }
    catch (err) {
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
      const result = await axios.delete(`${import.meta.env.VITE_API_URL}/hotel/deletehotel/${id}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

      if (result.status === 200) {
        fetchhotels()
      }
    }
    catch (err) {
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

  async function handleapprove(item) {
    try {
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/approvehotel`, { ...item },{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

      console.log(result);
      if (result.status === 200) {
        fetchhotels()
      }

    }
    catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      alert(err?.response?.data?.message || "something error please retry")

    }
  }

  const [Reason, setReason] = useState({
    item: {},
    reason: ""
  })
  const [reasonpopup, setreasonpopup] = useState(false);

  async function handlereject() {
    console.log(Reason);
    const item = Reason.item
    const reason = Reason.reason
    try {
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/rejecthotel`, { ...item, reason },{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

      console.log(result);
      if (result.status === 200) {
        fetchhotels()
        setReason({
          item: {},
          reason: ""
        })
      }

    }
    catch (err) {
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

  const [view, setview] = useState(null)

  async function handleview(id) {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/hotel/getonehotel/${id}`,)

      setview(result?.data?.response)
    }
    catch (err) {
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



  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedsearch, sort, status]);

  useEffect(() => {
    fetchhotels()
  }, [debouncedsearch, sort, status, currentPage, limit])

  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const startItem = totalHotels === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalHotels);

  const filteredhotel = hoteldata;

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/download/pdf`,
        { pdfdata: hoteldata },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hotels.pdf');
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
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${status === "pending"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            onClick={() => setstatus("pending")}
          >
            Pending requests
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${status === "rejected"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            onClick={() => setstatus("rejected")}
          >
            Rejected Hotels
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${status === "active"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            onClick={() => setstatus("active")}
          >
            Active
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${status === "inactive"
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
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
          >
            <option value="">No sorting</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        <div className="flex gap-3 justify-start sm:justify-end">
           <button onClick={handleDownloadPDF} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2">
                <Download className="h-4 w-4" /> PDF
              </button>
          <button
            className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => navigate('/hotelform')}
          >
            + Add Hotel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
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
              <div className="flex flex-col sm:flex-row h-full">

                {/* Hotel Image (if available, fallback if not) */}
                <div className="sm:w-48 shrink-0">
                  {item.images ? (
                    <img
                      src={item.images}
                      alt={item.hotelName}
                      loading="lazy"
                      decoding="async"
                      className="h-48 w-full object-cover sm:h-full"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 sm:h-full">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between p-5">

                  <div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                          {item.hotelName}
                        </h2>
                        <p className="mt-0.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Owner: {item.admin_id?.ownername || "—"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${item.approveStatus === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : item.approveStatus === "pending"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                      >
                        {item.approveStatus || "pending"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">

                      <div className="col-span-2">
                        <p className="text-slate-400">Address</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {item.Address}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">City</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {item.CityId?.cityname || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">Phone</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {item.hotelPhone}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-slate-400">Email</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300 break-all">
                          {item.hotelEmail}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-2 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button
                      className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-600 transition hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20"
                      onClick={() => handleview(item._id)}
                    >
                      View
                    </button>

                    {item.approveStatus === "pending" && (
                      <>
                        <button
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                          onClick={() => handleapprove(item)}
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          onClick={() => {
                            setreasonpopup(true);
                            setReason({ ...Reason, item: item });
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {item.activeStatus === true && (
                      <>
                        <button
                          className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-600 transition hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                          onClick={() => handledeactivate(item._id)}
                        >
                          Deactivate
                        </button>
                        <button
                          className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          onClick={() => handledelete(item._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {item.activeStatus === false && item.approveStatus === "approved" && (
                      <>
                        <button
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                          onClick={() => handlerestore(item._id)}
                        >
                          Restore
                        </button>
                        <button
                          className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          onClick={() => handledelete(item._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalHotels > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{startItem}</strong> to{" "}
              <strong className="text-slate-900 dark:text-white">{endItem}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{totalHotels}</strong> hotels
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
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >Previous</button>
            <div className="flex items-center gap-1">
              {getPageNumbers.map((p, idx) =>
                p === '...' ? (
                  <span key={`d${idx}`} className="px-1.5 text-xs text-slate-400">...</span>
                ) : (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${currentPage === p ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}>{p}</button>
                )
              )}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >Next</button>
          </div>
        </div>
      )}
      {reasonpopup && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Reject hotel</h2>
            <button className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" onClick={() => setreasonpopup(false)}>Close</button>
          </div>
          <div className="flex gap-3">
            <input className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" type="text" placeholder='Reason for rejection' name=""
              value={Reason.reason} onChange={(e) => setReason({ ...Reason, reason: e.target.value })} id="" />
            <button className="rounded-lg bg-rose-600 px-4 py-2 font-medium text-white transition hover:bg-rose-700" onClick={() => {
              handlereject()
              setreasonpopup(false)
            }}>Reject</button>
          </div></div>
      </div>
      }

      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-auto flex flex-col">

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
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${view.approveStatus === "approved"
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
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${view.activeStatus
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

export default Hotelsmanage
