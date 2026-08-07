import axios from 'axios';
import React, { useEffect, useState } from 'react'
import UseDebouncing from '../Hooks/UseDebouncing';

function Citymanage() {

      const [status, setstatus] = useState("active");
      const [search,setsearch]=useState("")
      const [sort,setsort]=useState("")
      const [districtsort,setdistrictsort]=useState("")

      const debouncedvalue=UseDebouncing(search,1000)

        const [citydata, setcitydata] = useState([]);
        const [districtdata, setdistrictdata] = useState([]);

        const [err,seterr]=useState({})

    const [popup, setpopup] = useState(false);

    const [cityd, setcityd] = useState({
    cityname: "",
    district_id: "",
  });

  
  
    async function fetchdistricts() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/location/getalldistrict?search&&status=true&&sort&&statesort`,
      );

      setdistrictdata(result?.data?.response || []);
    } catch (err) {
      console.log(err);
    }
  }

    async function fetchcity() {
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/location/getallcity?search=${search}&&status=${(status==="active" ? true : false )}&&sort=${sort}&&districtsort=${districtsort}`,
          );
    
          setcitydata(result?.data?.response || []);
        } catch (err) {
          console.log(err.response);
        }
      }
    
      async function handlecityadd(e) {
        e.preventDefault();

        let obj={}

        if(!cityd.cityname) obj.cityname="city is required"
        if(!cityd.district_id) obj.district_id="district select is required"

        seterr(obj)
        if(Object.keys(obj).length===0){
         if(cityd._id){
            try {
          const result = await axios.patch(
            `${import.meta.env.VITE_API_URL}/location/updatecity`,
            cityd,
          );
          if (result.status === 200) {
            fetchcity();
            setcityd({ cityname: "", district_id: "" });
            setpopup("");
          }
        } catch (err) {
          console.log(err);
        }
         } 
         else{
            try {
          const result = await axios.post(
            `${import.meta.env.VITE_API_URL}/location/addcity`,
            cityd,
          );
          if (result.status === 201) {
            fetchcity();
            setcityd({ cityname: "", district_id: "" });
            setpopup(false);
          }
        } catch (err) {
          console.log(err);
        }
        }
    }
      }

      async function handledeactivate(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/location/softdeletecity/${id}`)

             if(result.status===200){
                fetchcity()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handlerestore(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/location/recoverdeletecity/${id}`)

             if(result.status===200){
                fetchcity()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handledelete(id){
           try{
              const result=await axios.delete(`${import.meta.env.VITE_API_URL}/location/deletecity/${id}`)

             if(result.status===200){
                fetchcity()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      const [view,setview]=useState(null)

      async function handleview(id){
           try{
              const result=await axios.get(`${import.meta.env.VITE_API_URL}/location/getonecity/${id}`)
           setview(result?.data?.response)
           }
           catch(err){
             console.log(err)
           }
      }



      useEffect(()=>{
        fetchdistricts()
      },[])
      
      useEffect(()=>{
        fetchcity()
      },[debouncedvalue,sort,districtsort,status])

   
     // Only active districts are selectable when adding a city
 function districtoption() {
  return districtdata.map((state) => {

    if(state.activestatus){
       const activeDistricts = state.alldistricts.filter(
      (district) => district.activestatus
    );

    if (activeDistricts.length === 0) return null;

       return activeDistricts.map((district) => (
          <option key={district._id} value={district._id}>
            {district.districtname} ({state.statename})
          </option>
        ))
    }
  });
}

  return (
     <div className="manage-page w-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:p-6">
          <div className="mb-5 flex w-full flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:w-auto">
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
      value={districtsort}
      onChange={(e) => setdistrictsort(e.target.value)}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-900"
    >
      <option value="">nosort</option>
      {districtoption()}
    </select>
            </div>
            <button
              className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => setpopup(true)}
            >
              + Add City
            </button>
          </div>

          
   {citydata.length === 0 ? (
        <div className="p-6 text-center text-slate-400">
          No data found
        </div>
      ) : (         
  <div className="space-y-6">
    {citydata.map((state) => (
    <div
      key={state._id}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      {/* State Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold capitalize text-slate-800 dark:text-white">
          {state.statename}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {state.country}
        </p>
      </div>

      {/* Districts */}
      {state.alldistricts.length === 0 ? (
        <div className="p-6 text-center text-slate-400">
          No districts found
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {state.alldistricts.map((district) => (
            <div key={district._id} className="p-6">
              {/* District Heading */}
              <h3 className="mb-4 text-lg font-semibold capitalize text-slate-700 dark:text-slate-200">
                {district.districtname}
              </h3>

              {/* Cities */}
              {district.allcities.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
                  No cities available
                </div>
              ) : (
                <div className="space-y-3">
                  {district?.allcities?.map((city) => (
                    <div
                      key={city._id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <span className="font-medium capitalize text-slate-700 dark:text-slate-200">
                        {city.cityname}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleview(city._id)}
                          className="rounded-md px-3 py-1.5 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-700"
                        >
                          View
                        </button>

                        

                        {status === "active" ? (
                          <>
                             <button
                          onClick={() =>{
                            setpopup(true)
                            setcityd(city)
                          }}
                          className="rounded-md bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          Edit
                        </button>
                            <button
                              onClick={() => handledeactivate(city._id)}
                              className="rounded-md bg-amber-50 px-3 py-1.5 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                              Deactivate
                            </button>                          
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handlerestore(city._id)}
                              className="rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                            >
                              Restore
                            </button>

                          </>
                        )}
                          <button
                              onClick={() => handledelete(city._id)}
                              className="rounded-md bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                            >
                              Delete
                            </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  ))}
</div>)}
          {view && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          View City
        </h2>

        <button
          onClick={() => setview(null)}
          className="text-2xl text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              City Name
            </p>
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {view.cityname}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              District
            </p>
            <p className="text-slate-800 dark:text-slate-100">
              {view.district_id?.districtname}
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
          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

          {popup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:shadow-black/40">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-800 dark:text-white">Add City</h3>
                  <button
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => {
                        setpopup(false)
                        setcityd({ cityname: "",
                             district_id: "",})
                    }}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handlecityadd} className="flex flex-col gap-3">
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:ring-emerald-900/40"
                    value={cityd.district_id}
                    onChange={(e) =>
                      setcityd({ ...cityd, district_id: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select district
                    </option>
                    {districtoption()}
                  </select>
                  <p>{err.district_id}</p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-emerald-900/40"
                    type="text"
                    placeholder="Enter city name"
                    value={cityd.cityname}
                    onChange={(e) =>
                      setcityd({ ...cityd, cityname: e.target.value })
                    }
                  />
                  <p>{err.cityname}</p>
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

export default Citymanage
