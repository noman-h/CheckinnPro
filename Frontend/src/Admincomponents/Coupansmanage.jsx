import axios from 'axios';
import React, { useEffect, useState } from 'react'
import UseDebouncing from '../Hooks/UseDebouncing';

function Coupansmanage() {

       const [status,setstatus]=useState("active")
   const [search,setsearch]=useState("")
   const [sort,setsort]=useState("")
   const [hotelsort,sethotelsort]=useState("")

   const debouncedsearch=UseDebouncing(search,1000)


      const [hoteldata, sethoteldata] = useState([]);
       const adminemail = localStorage.getItem('email');
      
      async function fetchhotels() {
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/hotel/getalladminhotels/${adminemail}?search&&sort&&status=active`,
          );
    
          sethoteldata(result?.data?.response || []);
        } catch (err) {
          console.log(err);
        }
      }

      const [coupandata, setcoupandata] = useState([]);

      // --- PAGINATION STATES ---
      const [currentPage, setCurrentPage] = useState(1);
      const [limit, setLimit] = useState(6);
      const [totalPages, setTotalPages] = useState(1);
      const [totalCoupons, setTotalCoupons] = useState(0);

      async function fetchcoupans() {
        try {
          const skip = (currentPage - 1) * limit;
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/coupan/getalladminhotelcoupans/${adminemail}?search=${debouncedsearch}&status=${status}&sort=${sort}&hotelsort=${hotelsort}&skip=${skip}&limit=${limit}`,
          );
    
          const responseData = result?.data?.response || [];
          setcoupandata(responseData);

          const count = result?.data?.totalcount ?? responseData.length;
          setTotalCoupons(count);
          setTotalPages(Math.ceil(count / limit) || 1);
        } catch (err) {
          console.log(err);
        }
      }

      async function handledeactivate(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/coupan/softdeletecoupan/${id}`)

             if(result.status===200){
                fetchcoupans()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handlerestore(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/coupan/recoverdeletecoupan/${id}`)

             if(result.status===200){
                fetchcoupans()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handledelete(id){
           try{
              const result=await axios.delete(`${import.meta.env.VITE_API_URL}/coupan/deletecoupan/${id}`)

             if(result.status===200){
                fetchcoupans()
             }
           }
           catch(err){
             console.log(err)
           }
      }

       const [view,setview]=useState(null)

      async function handleview(id){
           try{
              const result=await axios.get(`${import.meta.env.VITE_API_URL}/coupan/getonecoupan/${id}`)
           setview(result?.data?.response)
           }
           catch(err){
             console.log(err)
           }
      }
  
      
  
    useEffect(()=>{
      fetchhotels()
    },[])

    // Reset to page 1 when filters change
    useEffect(()=>{
      setCurrentPage(1);
    },[debouncedsearch, sort, status, hotelsort])

    useEffect(()=>{
       fetchcoupans()
    },[debouncedsearch,sort,status,hotelsort,currentPage,limit])

    // --- PAGE NUMBERS GENERATOR ---
    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
        else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages-3, totalPages-2, totalPages-1, totalPages);
        else pages.push(1, '...', currentPage-1, currentPage, currentPage+1, '...', totalPages);
      }
      return pages;
    };

    const startItem = totalCoupons === 0 ? 0 : (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalCoupons);

    const [addpopup,setaddpopup]=useState(false)

    const [coupand,setcoupand]=useState({
         hotel_id:"",
         coupancode:"",
         discount:"",
         startdate:"",
         enddate:"",
         maxprice:""
             })


    const [err,seterr]=useState({})         
    function handlechange(key,value){
         setcoupand({...coupand,[key]:value})

         if(err[key]){
            seterr({...err,[key]:""})
         }
    }

    function validate() {
  const obj = {};

  // Hotel
  if (!coupand.hotel_id) {
    obj.hotel_id = "Please select a hotel";
  }

  // Coupon Code
  if (!coupand.coupancode.trim()) {
    obj.coupancode = "Coupon code is required";
  } else if (coupand.coupancode.length < 4) {
    obj.coupancode = "Coupon code must be at least 4 characters";
  } else if (!/^[A-Za-z0-9_-]+$/.test(coupand.coupancode)) {
    obj.coupancode = "Only letters, numbers, _ and - are allowed";
  }

  // Discount
  if (!coupand.discount) {
    obj.discount = "Discount is required";
  } else if (
    isNaN(coupand.discount) ||
    Number(coupand.discount) < 1 ||
    Number(coupand.discount) > 100
  ) {
    obj.discount = "Discount must be between 1 and 100";
  }

  // Start Date
  if (!coupand.startdate) {
    obj.startdate = "Start date is required";
  }

  // End Date
  if (!coupand.enddate) {
    obj.enddate = "End date is required";
  }

  // Date Validation
  if (coupand.startdate && coupand.enddate) {
    const start = new Date(coupand.startdate);
    const end = new Date(coupand.enddate);

    if (end < start) {
      obj.enddate = "End date must be after start date";
    }
  }
  
  // Maximum Price
  if (!coupand.maxprice) {
    obj.maxprice = "Maximum price is required";
  } else if (
    isNaN(coupand.maxprice) ||
    Number(coupand.maxprice) <= 0
  ) {
    obj.maxprice = "Maximum price must be greater than 0";
  }

  seterr(obj);

  return Object.keys(obj).length === 0;
}
    
   async function handleadd(e){
   
        e.preventDefault()
     
        if(!validate()) return

        if(coupand._id){
          try {
          const result = await axios.patch(
            `${import.meta.env.VITE_API_URL}/coupan/updatecoupan`,
            coupand,
          );
          if (result.status === 200) {
            fetchcoupans();
            setcoupand({
                 hotel_id:"",
         coupancode:"",
         discount:"",
         startdate:"",
         enddate:"",
         maxprice:""
            })
            setaddpopup(false)
          }
        } catch (err) {
          console.log(err);
        }
        }
        else{
         try {
                
          const result = await axios.post(
            `${import.meta.env.VITE_API_URL}/coupan/addcoupan`,
            coupand,
          );
          if (result.status === 201) {
            fetchcoupans();
            setcoupand({
                 hotel_id:"",
         coupancode:"",
         discount:"",
         startdate:"",
         enddate:"",
         maxprice:""
            })
            setaddpopup(false)
          }
        } catch (err) {
          console.log(err);
        }
        }

    }

   
  const filterdata=coupandata
  
  console.log(coupandata);
  
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
      placeholder="Search coupans..."
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

    {/* hotelfilter */}
    <select
      value={hotelsort}
      onChange={(e) => sethotelsort(e.target.value)}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
    >
      <option value="">choose hote....</option>
      {hoteldata.map((h)=> <option value={h._id}>{h.hotelName}</option> )}
    </select>
              
            </div>
             <button
              className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={()=>setaddpopup(true)}
            >
              + Add Coupans
            </button>
          </div>

         <div className="space-y-4">
  {filterdata.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      No coupons found
    </div>
  ) : (
    filterdata.map((c) => (
      <div
        key={c._id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Coupon Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="rounded-lg bg-emerald-100 px-3 py-1 text-lg font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {c.coupancode}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  c.activestatus
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {c.activestatus ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
             <div className="grid gap-3 text-sm sm:grid-cols-3">
  <div>
    <p className="text-slate-500 dark:text-slate-400">
      Discount
    </p>
    <p className="font-semibold text-slate-800 dark:text-white">
      {c.discount}%
    </p>
  </div>

  <div>
    <p className="text-slate-500 dark:text-slate-400">
      Hotel
    </p>
    <p className="font-semibold text-slate-800 dark:text-white">
      {c?.hoteldata?.hotelName}
    </p>
  </div>

  <div>
    <p className="text-slate-500 dark:text-slate-400">
      Maximum Price
    </p>
    <p className="font-semibold text-slate-800 dark:text-white">
      ₹{c.maxprice}
    </p>
  </div>
</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-end gap-2 lg:w-56">
            <button
              className="rounded-lg px-4 py-2 font-medium text-sky-600 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-800"
              onClick={()=>handleview(c._id)}
            >
              View
            </button>

            {status === "active" && (
              <>
                <button
                  className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                  onClick={()=>{
                    setaddpopup(true)
                    setcoupand({...c,hotel_id:c?.hotel_id?._id})
                  }}
                >
                  Edit
                </button>

                <button
                  className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
                  onClick={()=>handledeactivate(c._id)}
                >
                  Deactivate
                </button>
              </>
            )}

            {status === "inactive" && (
              <button
                className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                onClick={()=>handlerestore(c._id)}
              >
                Restore
              </button>
            )}

            <button
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
              onClick={()=>handledelete(c._id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))
  )}
</div>

{/* --- PAGINATION CONTROLS --- */}
{totalCoupons > 0 && (
  <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
      <span>
        Showing <strong className="text-slate-900 dark:text-white">{startItem}</strong> to{" "}
        <strong className="text-slate-900 dark:text-white">{endItem}</strong> of{" "}
        <strong className="text-slate-900 dark:text-white">{totalCoupons}</strong> coupons
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
    <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Coupon Details
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View coupon information
          </p>
        </div>

        <button
          onClick={() => setview("")}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="space-y-6 p-6">

        {/* Coupon Information */}
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
            Coupon Information
          </h3>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Coupon Code
              </p>
              <p className="mt-1 font-semibold uppercase text-slate-800 dark:text-white">
                {view.coupancode}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Discount
              </p>
              <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                {view.discount}%
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Maximum Price
              </p>
              <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                ₹{view.maxprice}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Start Date
              </p>
              <p className="mt-1 text-slate-800 dark:text-white">
                {new Date(view.startdate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                End Date
              </p>
              <p className="mt-1 text-slate-800 dark:text-white">
                {new Date(view.enddate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  view.activestatus
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
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
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
            Hotel Information
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hotel Name
              </p>
              <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                {view.hotel_id.hotelName}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Address
              </p>
              <p className="mt-1 text-slate-700 dark:text-slate-300">
                {view.hotel_id.Address}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
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



        {/* coupan add form */}
        {addpopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {coupand._id ? "Update Coupon" : "Add Coupon"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fill in the coupon details below.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setaddpopup(false);
            seterr({});
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form className="space-y-5 p-6" onSubmit={handleadd}>

        {/* Coupon Code */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Coupon Code
          </label>
          <input
            type="text"
            value={coupand.coupancode}
            placeholder="Enter coupon code"
            onChange={(e) => handlechange("coupancode", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900"
          />
          <p className="mt-1 text-sm text-red-500">{err.coupancode}</p>
        </div>

        {/* Discount & Max Price */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Discount (%)
            </label>
            <input
              type="number"
              value={coupand.discount}
              placeholder="Enter discount"
              onChange={(e) => handlechange("discount", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900"
            />
            <p className="mt-1 text-sm text-red-500">{err.discount}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Maximum Price
            </label>
            <input
              type="number"
              value={coupand.maxprice}
              placeholder="Enter maximum price"
              onChange={(e) => handlechange("maxprice", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900"
            />
            <p className="mt-1 text-sm text-red-500">{err.maxprice}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Start Date
            </label>
            <input
              type="date"
              value={coupand.startdate.split("T")[0]}
              onChange={(e) => handlechange("startdate", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900"
            />
            <p className="mt-1 text-sm text-red-500">{err.startdate}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              End Date
            </label>
            <input
              type="date"
              value={coupand.enddate.split("T")[0]}
              onChange={(e) => handlechange("enddate", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900"
            />
            <p className="mt-1 text-sm text-red-500">{err.enddate}</p>
          </div>
        </div>

        {/* Hotel */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Select Hotel
          </label>

          <select
            value={coupand.hotel_id}
            onChange={(e) => handlechange("hotel_id", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900"
          >
            <option value="">Select Hotel</option>

            {hoteldata.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.hotelName}
              </option>
            ))}
          </select>

          <p className="mt-1 text-sm text-red-500">{err.hotel_id}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setaddpopup(false)}
            className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-2.5 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {coupand._id ? "Update Coupon" : "Add Coupon"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
       
        </div>
  )
}


export default Coupansmanage