import axios from 'axios';
import React, { useEffect, useState } from 'react'
import UseDebouncing from '../Hooks/UseDebouncing';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';

function Statemanage() {

 const navigate=useNavigate()
  const [search, setsearch] = useState("")
  const [sort, setsort] = useState("")

  const debouncedvalue = UseDebouncing(search, 1000)


  const [status, setstatus] = useState("active");

  const [popup, setpopup] = useState("");

  const [statedata, setstatedata] = useState([]);
  const [err, seterr] = useState({})
  const [stated, setstatd] = useState({
    statename: ""
  });

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStates, setTotalStates] = useState(0);

  const token=localStorage.getItem('token')
  async function fetchstates() {
    try {
      const skip = (currentPage - 1) * limit;
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/location/getallstate?search=${debouncedvalue}&status=${(status === "active" ? true : false)}&sort=${sort}&skip=${skip}&limit=${limit}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
      );

      const responseData = result?.data?.response || [];
      setstatedata(responseData);

      const count = result?.data?.totalcount ?? responseData.length;
      setTotalStates(count);
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


  async function handlestateadd(e) {
    e.preventDefault();

    let obj = {}


    if (!stated.statename) obj.statename = "city is required"


    seterr(obj)
    if (Object.keys(obj).length === 0) {
      if (stated._id) {
        try {
          const result = await axios.patch(
            `${import.meta.env.VITE_API_URL}/location/updatestate`,
            stated,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
          );
          if (result.status === 200) {
            fetchstates();
            setstatd({ statename: "" })
            setpopup("");
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
          console.log(err);
        }
      }
      else {
        try {

          const result = await axios.post(
            `${import.meta.env.VITE_API_URL}/location/addstate`,
            stated,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
          );
          if (result.status === 201) {
            fetchstates();
            setstatd({ statename: "" });
            setpopup("");
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
          console.log(err);
        }
      }
    }
  }

  async function handledeactivate(id) {
    try {
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/location/softdeletestate/${id}`,{},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

      if (result.status === 200) {
        fetchstates()
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
      const result = await axios.patch(`${import.meta.env.VITE_API_URL}/location/recoverdeletestate/${id}`,{},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

      if (result.status === 200) {
        fetchstates()
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
      const result = await axios.delete(`${import.meta.env.VITE_API_URL}/location/deletestate/${id}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

      if (result.status === 200) {
        fetchstates()
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

  const [view, setview] = useState(null)

  async function handleview(id) {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/location/getonestate/${id}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
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
      console.log(err)
    }
  }



  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedvalue, sort, status]);

  useEffect(() => {
    fetchstates()
  }, [debouncedvalue, sort, status, currentPage, limit])

  const getPageNumbers = () => {
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
  };

  const startItem = totalStates === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalStates);

  const filteredstate = statedata

    const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/download/pdf`,
        { pdfdata: statedata },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'states.pdf');
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
    <div className="manage-page w-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:p-6">

      <div className="mb-5 flex w-full flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-5 w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:w-auto">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${status === "active"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            onClick={() => setstatus("active")}
          >
            Active
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${status === "inactive"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            onClick={() => setstatus("inactive")}
          >
            Inactive
          </button>

          <input
            type="text"
            placeholder="Search state..."
            value={search}
            onChange={(e) => setsearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900 sm:max-w-xs"
          />

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setsort(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
          >
            <option value="">nosort</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

        </div>

        <div className='flex gap-3'>
           <button onClick={handleDownloadPDF} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2">
                <Download className="h-4 w-4" /> PDF
              </button>
        <button
          className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setpopup("stateadd")}
        >
          + Add State
        </button>
        </div>
        
      </div>

      <div className="space-y-4">
        {filteredstate.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-400 dark:border-slate-700">
            No data found
          </div>
        ) : (
          filteredstate.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                {/* Left */}
                <div>
                  <h2 className="text-lg font-semibold capitalize text-slate-800 dark:text-white">
                    {item.statename}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.country}
                  </p>

                  <div className="mt-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${item.activestatus
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                    >
                      {item.activestatus ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-wrap gap-2 md:justify-end">
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
                          setpopup("stateadd");
                          setstatd(item);
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
      {totalStates > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{startItem}</strong> to{" "}
              <strong className="text-slate-900 dark:text-white">{endItem}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{totalStates}</strong> states
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
              {getPageNumbers().map((p, idx) =>
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
        </div>)}
    


  
    {view && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              View State
            </h2>

            <button
              onClick={() => setview(null)}
              className="text-2xl text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  State Name
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {view.statename}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Country
                </p>
                <p className="text-slate-800 dark:text-slate-100">
                  {view.country}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Active Status
                </p>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${view.activestatus
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    }`}
                >
                  {view.activestatus ? "Active" : "Inactive"}
                </span>
              </div>

            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

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
    )
  }

  {
    popup === "stateadd" && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:shadow-black/40">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-white">Add State</h3>
            <button
              className="text-slate-400 hover:text-slate-600"
              onClick={() => {
                setpopup("")
                setstatd({ statename: "" })
              }}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handlestateadd} className="flex flex-col gap-3">
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-emerald-900/40"
              type="text"
              placeholder="Enter state name"
              value={stated.statename}
              onChange={(e) => setstatd({ ...stated, statename: e.target.value })}
            />
            <button
              type="submit"
              className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    )
  }
        </div >
  )
}

export default Statemanage
