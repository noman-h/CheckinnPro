import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

function Adminmanage() {

    const navigate=useNavigate()
    const [status, setstatus] = useState("active");

    
      const [admindata, setadmindata] = useState([]);

    
      async function fetchadmins() {
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/admin/getalladmins`,
          );
    
          setadmindata(result?.data?.response || []);
        } catch (err) {
          console.log(err);
        }
      }
    

  async function handledeactivate(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/admin/softdeleteadmin/${id}`)

             if(result.status===200){
                fetchadmins()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handlerestore(id){
           try{
              const result=await axios.patch(`${import.meta.env.VITE_API_URL}/admin/recoverdeleteadmin/${id}`)

             if(result.status===200){
                fetchadmins()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handledelete(id){
           try{
              const result=await axios.delete(`${import.meta.env.VITE_API_URL}/admin/deleteadmin/${id}`)

             if(result.status===200){
                fetchadmins()
             }
           }
           catch(err){
             console.log(err)
           }
      }

      async function handleapprove(item) {
            try{
               const result=await axios.patch(`${import.meta.env.VITE_API_URL}/admin/approveadmin`,{...item})

               console.log(result);
               if(result.status===200){
                fetchadmins()
               }

            }
            catch(err){
               alert(err?.response?.data?.message || "something error please retry")
               
            }
      }

      const [Reason,setReason]=useState({
        item:{},
        reason:""
      })
      const [reasonpopup,setreasonpopup]=useState(false);

      async function handlereject() {
        console.log(Reason);
           const item=Reason.item
           const reason=Reason.reason
            try{
               const result=await axios.patch(`${import.meta.env.VITE_API_URL}/admin/rejectadmin`,{...item,reason})

               console.log(result);
               if(result.status===200){
                fetchadmins()
                setReason({
                  item:{},
                  reason:""
                })
               }

            }
            catch(err){
                  alert(err)
                  
            }
      }

     const [view,setview]=useState(null)

     async function handleview(id){
        try{
           const result=await axios.get(`${import.meta.env.VITE_API_URL}/admin/getoneadmin/${id}`)

           setview(result?.data?.response)
        }
        catch(err){
          console.log(err);
          
        }
     }
     console.log(view);
     

      useEffect(()=>{
         fetchadmins()
      },[])

    // states filtered by their own activestatus
  const filteredadmin = admindata.filter((i) =>
  {
    if(status === "active") return  i.activeStatus === true 
    if(status === "inactive") return (i.activeStatus === false && i.approveStatus==="approved")
    if(status === "pending") return i.approveStatus==="pending"
    if(status === "rejected") return i.approveStatus==="rejected"
  }
  );

  console.log(admindata);
  

  
  return (
   <div className="manage-page w-full rounded-xl bg-white p-3 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
          <div className="w-full flex justify-between items-center pb-3">
            <div className="flex gap-2">
                <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  status === "pending"
                    ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
                onClick={() => setstatus("pending")}
              >
                Pending requests
              </button>
                <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  status === "rejected"
                    ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
                onClick={() => setstatus("rejected")}
              >
                Rejected Admins
              </button>
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
              
            </div>
            <button
              className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => navigate('/adminaddform')}
            >
              + Add Admin
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-230 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Admin</th>
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-4 py-2">City</th>
                  <th className="px-4 py-2">Approval status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredadmin.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  filteredadmin.map((item, idx) => (
                    <tr key={item._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70">
                      <td className="px-4 py-2 text-slate-400 dark:text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-100">
                        <p>{item.ownername}</p>
                        <p className="mt-0.5 text-xs font-normal text-slate-500 dark:text-slate-400">{item.Address}</p>
                      </td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                        <p>{item.owneremail}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.hotelPhone}</p>
                      </td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                        {item.cityId?.cityname || "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.approveStatus === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : item.approveStatus === "rejected"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}>
                          {item.approveStatus || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-md px-2 py-1 font-medium text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:text-sky-400 dark:hover:bg-slate-800" onClick={()=>handleview(item._id)}>View</button>
                          {(item.approveStatus==="pending") && 
                          <div>
                            <button className="rounded-md px-2 py-1 font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-slate-800" onClick={()=>handleapprove(item)}>Approve</button>
                         <button className="rounded-md px-2 py-1 font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-slate-800" onClick={()=>{setreasonpopup(true) 
                           setReason({...Reason,item:item})
                          }}>reject</button>
                          </div>
                           }
                          {item.activeStatus===true && (
                            <>
                              <button className="rounded-md px-2 py-1 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-slate-800"
                              onClick={()=>handledeactivate(item._id)}>
                                Deactivate
                              </button>
                            
                            </>
                          )} {(item.activeStatus===false && item.approveStatus==="approved" )&& (
                            <>
                              <button className="rounded-md px-2 py-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-slate-800" onClick={()=>handlerestore(item._id)}>
                                Restore
                              </button>
                              
                            </>
                            
                          )}
                            <button className="rounded-md px-2 py-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-slate-800"
                               onClick={()=>handledelete(item._id)}>
                                Delete
                              </button>
                        </div>
                       
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {reasonpopup && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
             <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
               <div className="mb-4 flex items-center justify-between">
                 <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Reject hotel</h2>
                 <button className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" onClick={()=>setreasonpopup(false)}>Close</button>
               </div>
             <div className="flex gap-3">
              <input className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" type="text" placeholder='Reason for rejection' name=""
              value={Reason.reason} onChange={(e)=>setReason({...Reason,reason:e.target.value})} id="" />
              <button className="rounded-lg bg-rose-600 px-4 py-2 font-medium text-white transition hover:bg-rose-700" onClick={()=>{handlereject() 
                setreasonpopup(false)
              }}>Reject</button>
             </div></div>
          </div>
          }

          {view && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="h-full w-full min-w-5xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-scroll scrollbar-thin">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          View Hotel Owner
        </h2>

        <button
          onClick={() => setview(null)}
          className="text-2xl text-slate-500 hover:text-red-500"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Profile Image
            </p>

            <img
              src={view.profileImage}
              alt=""
              className="h-56 w-full rounded-lg border object-cover"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Aadhaar Front
            </p>

            <img
              src={view.aadhaarFront}
              alt=""
              className="h-56 w-full rounded-lg border object-cover"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Aadhaar Back
            </p>

            <img
              src={view.aadhaarBack}
              alt=""
              className="h-56 w-full rounded-lg border object-cover"
            />
          </div>

        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <p className="text-sm text-slate-500">Owner Name</p>
            <p className="font-semibold text-slate-800 dark:text-white">
              {view.ownername}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="text-slate-800 dark:text-white">
              {view.owneremail}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Phone</p>
            <p className="text-slate-800 dark:text-white">
              {view.ownerphone}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Role</p>
            <p className="text-slate-800 dark:text-white">
              {view.role}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">City</p>
            <p className="text-slate-800 dark:text-white">
              {view.cityId?.cityname}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Aadhaar Number</p>
            <p className="text-slate-800 dark:text-white">
              {view.aadhaarNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Check ID</p>
            <p className="break-all text-slate-800 dark:text-white">
              {view.checkid}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Approval Status</p>

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
            <p className="text-sm text-slate-500">Active Status</p>

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

        {/* Address */}
        <div>
          <p className="mb-2 text-sm text-slate-500">
            Address
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            {view.address}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <p className="text-sm text-slate-500">
              Created At
            </p>

            <p className="text-slate-800 dark:text-white">
              {new Date(view.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Updated At
            </p>

            <p className="text-slate-800 dark:text-white">
              {new Date(view.updatedAt).toLocaleString()}
            </p>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-200 dark:border-slate-700 px-6 py-4">

        <button
          onClick={() => setview(null)}
          className="rounded-lg bg-emerald-600 px-5 py-2 text-white transition hover:bg-emerald-700"
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

export default Adminmanage
