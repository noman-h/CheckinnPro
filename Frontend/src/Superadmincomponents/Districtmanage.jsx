import axios from 'axios';
import React, { useEffect, useState } from 'react'
import UseDebouncing from '../Hooks/UseDebouncing';

function Districtmanage() {

       const [search,setsearch]=useState("")
       const [statesort,setstatesort]=useState("")
       const [sort,setsort]=useState("")

       const debouncedsearch=UseDebouncing(search,1000)

      const [status, setstatus] = useState("active");
      const [popup, setpopup] = useState("");

      const [districtdata, setdistrictdata] = useState([]);
      const [statedata, setstatedata] = useState([]);
       
      const [err,seterr]=useState({})
      
      const [districtd, setdistrictd] = useState({
        districtname: "",
        state_id: "",
      });

      // --- PAGINATION STATES ---
      const [currentPage, setCurrentPage] = useState(1);
      const [limit, setLimit] = useState(6);
      const [totalPages, setTotalPages] = useState(1);
      const [totalDistricts, setTotalDistricts] = useState(0);


      async function fetchstates() {
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/location/getallstate?search&&status=${true}&&sort`,
          );
    
          setstatedata(result?.data?.response || []);
        } catch (err) {
          console.log(err);
        }
      }
    

    async function fetchdistricts() {
      try {
        const skip = (currentPage - 1) * limit;
        const result = await axios.get(
          `${import.meta.env.VITE_API_URL}/location/getalldistrict?search=${debouncedsearch}&status=${(status==="active" ? true : false )}&sort=${sort}&statesort=${statesort}&skip=${skip}&limit=${limit}`,
        );
  
        const responseData = result?.data?.response || [];
        setdistrictdata(responseData);

        const count = result?.data?.totalcount ?? responseData.length;
        setTotalDistricts(count);
        setTotalPages(Math.ceil(count / limit) || 1);
      } catch (err) {
        console.log(err);
      }
    }

  async function handledistrictadd(e) {
        e.preventDefault();

        let obj={}
        
         
        if(!districtd.districtname) obj.districtname="city is required"
        if(!districtd.state_id) obj.state_id="district select is required"

        seterr(obj)
        if(Object.keys(obj).length===0){
         if(districtd._id){
            try {
          const result = await axios.patch(
            `${import.meta.env.VITE_API_URL}/location/updatedistrict`,
            districtd,
          );
          if (result.status === 200) {
            fetchdistricts();
            setdistrictd({ districtname: "",
        state_id: "" });
            setpopup("");
          }
        } catch (err) {
          console.log(err);
        }
         } 
         else{
            try {
                
          const result = await axios.post(
            `${import.meta.env.VITE_API_URL}/location/adddistrict`,
            districtd,
          );
          if (result.status === 201) {
            fetchdistricts();
            setdistrictd({ districtname: "",
        state_id: ""});
            setpopup("");
          }
        } catch (err) {
          console.log(err);
        }
        }
    }
      }

  async function handledeactivate(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/location/softdeletedistrict/${id}`)

             if(result.status===200){
                fetchdistricts()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handlerestore(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/location/recoverdeletedistrict/${id}`)

             if(result.status===200){
                fetchdistricts()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handledelete(id){
           try{
              const result=await axios.delete(`${import.meta.env.VITE_API_URL}/location/deletedistrict/${id}`)

             if(result.status===200){
                fetchdistricts()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      const [view,setview]=useState(null)

      async function handleview(id){
           try{
              const result=await axios.get(`${import.meta.env.VITE_API_URL}/location/getonedistrict/${id}`)
           setview(result?.data?.response)
           }
           catch(err){
             console.log(err)
           }
      }
      
  useEffect(()=>{
    fetchstates()
  },[])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedsearch, sort, statesort, status]);

  useEffect(()=>{
    fetchdistricts()
  },[debouncedsearch,sort,statesort,status,currentPage,limit])

  const getPageNumbers = () => {
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
  };

  const startItem = totalDistricts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalDistricts);

    function stateoption() {
    const fildata = statedata.filter((i) => i.activestatus === true);
    return fildata.map((item) => (
      <option key={item._id} value={item._id}>
        {item.statename}
      </option>
    ));
  }
  

  return (
    <div className="manage-page w-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:p-6">
          <div className="mb-5 flex w-full flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-5 w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:w-auto">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  status === "active"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
                onClick={() => setstatus("active")}
              >
                Active
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  status === "inactive"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
                onClick={() => setstatus("inactive")}
              >
                Inactive
              </button>

              <input
      type="text"
      placeholder="Search district..."
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
    
    <select
      value={statesort}
      onChange={(e) => setstatesort(e.target.value)}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
    >
      <option value="">nosort</option>
      {stateoption()}
    </select>

            </div>
            <button
              className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => setpopup("districtadd")}
            >
              + Add District
            </button>
          </div>

{!districtdata.length ? 
    <div className="px-6 py-8 text-center text-slate-400">
          No districts available
        </div> :
      
      <div className="space-y-6">
  {districtdata.map((state) => { 

    return (
    <div
      key={state._id}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            {state.statename}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {state.country} • {state?.alldistricts?.length} District
            {state?.alldistricts?.length !== 1 && "s"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            state.activestatus
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          }`}
        >
          {state.activestatus ? "Active" : "Inactive"}
        </span>
      </div>

      {/* District List */}
      {state?.alldistricts?.length === 0 ? (
        <div className="px-6 py-8 text-center text-slate-400">
          No districts available
        </div>
      ) : (
        state?.alldistricts?.map((district, index) => (
          <div
            key={district._id}
            className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 ${
              index !== state?.alldistricts?.length - 1
                ? "border-b border-slate-200 dark:border-slate-700"
                : ""
            }`}
          >
            <div>
              <h3 className="font-medium text-slate-800 dark:text-white">
                {district.districtname}
              </h3>

              <p className="text-xs text-slate-500">
                District
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-md px-3 py-1.5 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-700" 
              onClick={()=>handleview(district._id)}>
                View
              </button>

              

              {status === "active" ? (
                <>
                  <button className="rounded-md bg-amber-50 px-3 py-1.5 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300" onClick={()=>handledeactivate(district._id)}>
                    Deactivate
                  </button>

                  <button className="rounded-md bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300" onClick={()=>{
                    setdistrictd(district);
                          setpopup("districtadd");
                  } }>
                Edit
              </button>
                </>
              ) : (
                <>
                  <button className="rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300" onClick={()=>handlerestore(district._id)}>
                    Restore
                  </button>

                </>
              )}
                  <button className="rounded-md bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300" onClick={()=> handledelete(district._id)}>
                    Delete
                  </button>
            </div>
          </div>
        ))
      )}
    </div>
  )})}
</div>}

{/* --- PAGINATION CONTROLS --- */}
{totalDistricts > 0 && (
  <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
      <span>
        Showing <strong className="text-slate-900 dark:text-white">{startItem}</strong> to{" "}
        <strong className="text-slate-900 dark:text-white">{endItem}</strong> of{" "}
        <strong className="text-slate-900 dark:text-white">{totalDistricts}</strong> districts
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
        {getPageNumbers().map((p,idx) =>
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

{view && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          View District
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
              District Name
            </p>
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {view.districtname}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              State
            </p>
            <p className="text-slate-800 dark:text-slate-100">
              {view.state_id?.statename}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Country
            </p>
            <p className="text-slate-800 dark:text-slate-100">
              {view.state_id?.country}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Active Status
            </p>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                view.activestatus
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
)}
          {popup === "districtadd" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:shadow-black/40">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-800 dark:text-white">Add District</h3>
                  <button
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() =>{ setpopup("")
                        setdistrictd({
                           districtname: "",
                          state_id: "",
                        })
                    }
                    }
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handledistrictadd} className="flex flex-col gap-3">
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:ring-emerald-900/40"
                    value={districtd.state_id}
                    onChange={(e) =>
                      setdistrictd({ ...districtd, state_id: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {stateoption()}
                  </select>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-emerald-900/40"
                    type="text"
                    placeholder="Enter district name"
                    value={districtd.districtname}
                    onChange={(e) =>
                      setdistrictd({ ...districtd, districtname: e.target.value })
                    }
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
          )}
        </div>
  )
}

export default Districtmanage
