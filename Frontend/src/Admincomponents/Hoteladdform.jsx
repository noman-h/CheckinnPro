import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

function Hoteladdform() {

  const navigate=useNavigate()
  const role=localStorage.getItem("user")

  const adminemail=localStorage.getItem("email")

  const {hotelid}=useParams()

 const token=localStorage.getItem('token')
  const [citydata, setcitydata] = useState([]);

  const [hoteld, sethoteld] = useState({
  hotelName: "",
  description: "",
  Address: "",
  CityId: "",
  admin_id:"",
  pricePerNight: "",
  totalRooms: "",
  hotelEmail: "",
  hotelPhone: "",
  hotelImage: null,
});


  const [errors, seterrors] = useState({});
  const [submitting, setsubmitting] = useState(false);
  const [successmsg, setsuccessmsg] = useState("");

  async function fetchcity() {
    try {
      const result = await axios.get(`${BASE_URL}/location/getallcity`);
      setcitydata(result?.data?.response || []);
      
    } catch (err) {
      console.log(err);
    }
  }

  const [admindata,setadmindata]=useState([])
  async function fetchadmins() {
    try {
      const result = await axios.get(`${BASE_URL}/admin/getalladmins`,{
          headers: { Authorization: `Bearer ${token}` },
        });
      setadmindata(result?.data?.response || []);
   
      
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
 


  const [checkstatus,setcheckstatus]=useState(false)
  const [showcheckdata,setshowcheckdata]=useState(false)
  const [checkid,setcheckid]=useState("")
  const [checkdata,setcheckdata]=useState(null)
  async function handlecheck() {

       if (!checkid || checkid.trim() === "") {
        seterrors({...errors,checkid:"Check ID is required"});
  return;
}

seterrors("");

         try{
            const result = await axios.get(`${BASE_URL}/hotel/getcheckone/${checkid}`,{
          headers: { Authorization: `Bearer ${token}` },
        });
           console.log(result);
           
            if(result.status===200){
              setcheckstatus(false)
              setshowcheckdata(true)
              setcheckid("")
              setcheckdata(result?.data?.response);
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
     alert(err?.response?.data?.message)
         
         }
  }
  
  

  const [notific,setnotific]=useState("")
  const [showOtpModal,setshowOtpModal]=useState(false)
  const [otp,setotp]=useState("")
  const [err,seterr]=useState("")
  async function handlesendotp() {
    const obj={}
    console.log("hey");
     try{
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/hotelotpsend`,{email:checkdata.hotelEmail},{
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("<<<",result);
        
       if(result.status===200){
         setnotific("otp send successfull")
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
      
      if(err.status===404){
        obj.email="email not found"
      }
      if(err.status===400){
         obj.otp="otp send failed"
      }
    }
    seterr(obj)
    }
  
  
  async function handleverifyotp() {
     const obj={}

     if(otp==="") obj.otp="otp is required"

      if(Object.keys(obj).length===0){
     try{
      
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/hotelotpverify`,{email:checkdata.hotelEmail,otp},{
          headers: { Authorization: `Bearer ${token}` },
        })
        if(result.status===200){
           sethoteld({...checkdata,CityId:checkdata?.CityId?._id})
           setshowOtpModal(false)
           setotp("")
           setnotific("otp verified successfully")
           setemailVerified(true)
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
         
      if(err.status===400){
        obj.otp="wrong otp"
      }
      if(err.status===403){
        obj.otp="otp expired"
      }
    }
    }
    seterr(obj)
  }

  


  const [showemailOtpModal,setshowemailOtpModal]=useState(false)
  const [otpsending,setotpsending]=useState(false)
  const [emailVerified,setemailVerified]=useState(false)
  const [otpverifying,setotpverifying]=useState(false)

  async function handleemailsendotp() {
    const obj={}

    if (!hoteld.hotelEmail){ 
      obj.owneremail="Email is required"
      return
    }

    setotpsending(true)
    setshowemailOtpModal(true)

    
     try{
        const result=await axios.post(`${import.meta.env.VITE_API_URL}/hotel/hotelemailotpsend`,{email:hoteld.hotelEmail},{
          headers: { Authorization: `Bearer ${token}` },
        })
        
       if(result.status===200){
         
         setnotific("otp send successfull")
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
      
      if(err.status===404){
        obj.email="email not found"
      }
      if(err.status===400){
         obj.otp="otp send failed"
      }
    }
    finally{
      setotpsending(false)
    }
    seterr(obj)
    }

     async function handleemailverifyotp() {
     const obj={}

     if(otp==="") obj.otp="otp is required"
       
      if(Object.keys(obj).length===0){
        setotpverifying(true)
     try{
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/hotelotpverify`,{email:hoteld.hotelEmail,otp},{
          headers: { Authorization: `Bearer ${token}` },
        })
        if(result.status===200){
           setemailVerified(true)
           setshowemailOtpModal(false)
           setnotific("otp verified successfully")
        }
       
    }
    catch(err){   
      console.log(err);
      if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
         
      if(err.status===400){
        obj.otp="wrong otp"
      }
      if(err.status===403){
        obj.otp="otp expired"
      }
    }
    finally{
      setotpverifying(false)
    }
    }
    seterr(obj)
  }

  const fetchHotel = async () => {
  try {
    const result = await axios.get(
      `${BASE_URL}/hotel/getonehotel/${hotelid}`
    );

    if (result.status === 200) {
      const hotel = result.data.response;
      sethoteld({...hotel,CityId:hotel?.CityId?._id,admin_id:hotel?.admin_id?._id})
    }
  } catch (err) {
    console.log(err);
  }
};



useEffect(() => {
  if (hotelid) {
    fetchHotel();
  }
}, [hotelid]);

  useEffect(() => {
    fetchcity();
    if(role==="superadmin"){
      setemailVerified(true)
      fetchadmins()
    }
    if(role==="admin"){
      sethoteld({...hoteld,admin_id:adminemail})
    }
  }, []);




  const cityoptions = citydata.map((city) => {
       return  <option key={city._id} value={city._id}>
          {city.cityname} ({city?.district_id?.districtname})  ({city.district_id.state_id.statename})   
          </option>
   
  });


  const adminoptions = admindata.filter((c) => c.activeStatus === true)
      .map((c) => (
        <option key={c._id} value={c._id}>
          {c.ownername} <span className="text-sm">({c.owneremail})</span>
        </option>
      ))

  function handlechange(field, value) {
    sethoteld({ ...hoteld, [field]: value });
    if (errors[field]) seterrors({ ...errors, [field]: "" });
  }

  function validate() {
    const e = {};
    if (!hoteld.hotelName.trim()) e.hotelName = "Hotel name is required";
    if (!hoteld.description.trim()) e.description = "Description is required";
    if (!hoteld.Address.trim()) e.Address = "Address is required";
    if (!hoteld.CityId) e.CityId = "Please select a city";
    if(role==="superadmin" && !hoteld.admin_id) e.admin_id = "Please select a admin";
    if (!hoteld.pricePerNight || Number(hoteld.pricePerNight) <= 0)
      e.pricePerNight = "Enter a valid price per night";
    if (!hoteld.totalRooms || Number(hoteld.totalRooms) <= 0)
      e.totalRooms = "Enter a valid number of rooms";
    if (!hoteld.hotelEmail.trim()) {
      e.hotelEmail = "Email is required";
    }
    
    if (!hoteld.hotelPhone.trim()) {
      e.hotelPhone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{7,15}$/.test(hoteld.hotelPhone)) {
      e.hotelPhone = "Enter a valid phone number";
    }
    if (!hoteld.hotelImage && !hoteld._id) {
  e.hotelImage = "Hotel image is required";
}
    seterrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlesubmit(e) {
    e.preventDefault();
    
    setsuccessmsg("");
    if (!validate()) return;
     setsubmitting(true);

     if(role==="superadmin" && 
!hoteld._id){
      try {
      const formData = new FormData();

Object.keys(hoteld).forEach((key) => {
  formData.append(key, hoteld[key]);
});

const result=await axios.post(
  `${BASE_URL}/hotel/addhoteldirect`,
  formData,
  {
    headers: {
    Authorization: `Bearer ${token}`,  
    "Content-Type": "multipart/form-data",
    },
  }
);
      if (result.status === 201) {
        setsuccessmsg("Hotel Requested successfully.");
        sethoteld({
          hotelName: "",
          description: "",
          Address: "",
          CityId: "",
          admin_id:"",
          pricePerNight: "",
          totalRooms: "",
          hotelEmail: "",
          hotelPhone: "",
          hotelImage: null,
        });
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
      seterrors({
        form:
          err?.response?.data?.message ||
          "Something went wrong while adding the hotel.",
      });
    } finally {
      setsubmitting(false);
    }
     }

   else if(hoteld._id){
        try {

      const formData = new FormData();

Object.keys(hoteld).forEach((key) => {
  formData.append(key, hoteld[key]);
});

const result=await axios.post(
  `${BASE_URL}/hotel/updatehotel`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  }
);
 
      if (result.status === 201) {
        setsuccessmsg("Hotel Updated successfully.");
        sethoteld({
          hotelName: "",
          description: "",
          Address: "",
          CityId: "",
          admin_id:"",
          pricePerNight: "",
          totalRooms: "",
          hotelEmail: "",
          hotelPhone: "",
          hotelImage: null,
        });
      }
    } catch (err) {
      console.log(err);
      if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }

      seterrors({
        form:
          err?.response?.data?.message ||
          "Something went wrong while updating the hotel.",
      });
    } finally {
      setsubmitting(false);
    }
    }
    else{


   
    try {
      const formData = new FormData();

Object.keys(hoteld).forEach((key) => {
  formData.append(key, hoteld[key]);
});

const result=await axios.post(
  `${BASE_URL}/hotel/addhotel`,
  formData,
  {
    headers: {
       Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  }
);
      if (result.status === 201) {
        setsuccessmsg("Hotel Requested successfully.");
        sethoteld({
          hotelName: "",
          description: "",
          Address: "",
          CityId: "",
          admin_id:"",
          pricePerNight: "",
          totalRooms: "",
          hotelEmail: "",
          hotelPhone: "",
          hotelImage: null,
        });
        setemailVerified(false)
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
      seterrors({
        form:
          err?.response?.data?.message ||
          "Something went wrong while adding the hotel.",
      });
    } finally {
      setsubmitting(false);
    }
    }
  }

  return (
    <div className="hotel-form-page">
       
  {showOtpModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
     <p className='mt-5 text-center text-sm font-medium text-emerald-700 dark:text-emerald-300'>{notific}</p>
    <div className="w-[90%] max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          OTP Verification
        </h2>

        <button
          onClick={() => setshowOtpModal(false)}
          className="text-2xl text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Hotel Email
        </label>

        <input
          type="email"
          value={checkdata.hotelEmail}
          disabled
          className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        />
      </div>

      {/* OTP */}
      <div className="mb-2">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter OTP
        </label>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setotp(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        {err?.otp && (
          <p className="mt-1 text-sm text-red-500">
            {err.otp}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-between gap-3">

        <button
          type="button"
          onClick={()=>handlesendotp()}
          className="rounded-lg bg-yellow-500 px-5 py-2 font-semibold text-white transition hover:bg-yellow-600"
        >
          Send OTP
        </button>

        <button
          type="button"
          onClick={()=>handleverifyotp()}
          className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700"
        >
          Verify OTP
        </button>

      </div>

      <button
        type="button"
        onClick={() => setshowOtpModal(false)}
        className="mt-4 w-full rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Cancel
      </button>

    </div>
  </div>
)}



        {/* email otp verify */}
        {showemailOtpModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
     <p className='mt-5 text-center text-sm font-medium text-emerald-700 dark:text-emerald-300'>{notific}</p>
    <div className="w-[90%] max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Email Verification
        </h2>

        <button
          onClick={() => setshowemailOtpModal(false)}
          className="text-2xl text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Owner Email
        </label>

        <input
          type="email"
          value={hoteld.hotelEmail}
          disabled
          className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        />
      </div>

      {/* OTP */}
      <div className="mb-2">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter OTP
        </label>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setotp(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        {err?.otp && (
          <p className="mt-1 text-sm text-red-500">
            {err.otp}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-between gap-3">

        <button
          type="button"
          onClick={()=>handleemailsendotp()}
          className="rounded-lg bg-yellow-500 px-5 py-2 font-semibold text-white transition hover:bg-yellow-600"
        >
          {otpsending ? "Sending..." : "send otp"}
        </button>

        <button
          type="button"
          onClick={()=>handleemailverifyotp()}
          disabled={otpsending}
          className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700"
        >
           {otpverifying ? "verifying..." : "Verify otp"}
        </button>

      </div>

      <button
        type="button"
        onClick={() => setshowemailOtpModal(false)}
        className="mt-4 w-full rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Cancel
      </button>

    </div>
  </div>
)}

       {(checkdata && showcheckdata) && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-[95%] max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Hotel Details
        </h2>

        <button
          onClick={() => setcheckdata(null)}
          className="text-2xl text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      {/* Details */}
      <div className="space-y-4">

        <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            Hotel Name
          </span>
          <span className="text-gray-800 dark:text-white">
            {checkdata.hotelName}
          </span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            Hotel Email
          </span>
          <span className="text-gray-800 dark:text-white">
            {checkdata.hotelEmail}
          </span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            Approve Status
          </span>

          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              checkdata.approveStatus === "approved"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : checkdata.approveStatus === "rejected"
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
            }`}
          >
            {checkdata.approveStatus}
          </span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            Created At
          </span>

          <span className="text-gray-800 dark:text-white">
            {new Date(checkdata.createdAt).toLocaleString()}
          </span>
        </div>

      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-end gap-3">

        <button
          onClick={() => setcheckdata(null)}
          className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Close
        </button>
        {checkdata.approveStatus==="pending" && 
        <button
          onClick={() =>{ setshowOtpModal(true)
             handlesendotp()
             setshowcheckdata(false)
          }}
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
        >
          Update
        </button>
        }
        

      </div>

    </div>
  </div>
)}

       {checkstatus && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-[90%] max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl transition-all dark:border-gray-700 dark:bg-gray-900">
      
      <h2 className="mb-5 text-center text-2xl font-bold text-gray-800 dark:text-white">
        Check Hotel Status
      </h2>

      <input
        type="text"
        placeholder="Enter your checkid"
        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
        onChange={(e)=>setcheckid(e.target.value)}
      />

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setcheckstatus(false)}
          className="rounded-xl border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>

        <button
          onClick={() => handlecheck()}
          className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 active:scale-95"
        >
          Check Status
        </button>

        {errors.checkid && (
  <p className="mt-1 text-sm text-red-500">
    {errors.checkid}
  </p>
)}
      </div>

    </div>
  </div>
)}

      <h2 className="mb-4 text-xl font-semibold text-slate-800">Add Hotel</h2>
      <div>

      {successmsg && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          {successmsg}
        </div>
      )}
      {errors.form && (
        <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {errors.form}
        </div>
      )}

      <form onSubmit={handlesubmit} className="flex flex-col gap-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      type='button'
    >
      ← Back
    </button>
  </div>

  <button
    onClick={() => setcheckstatus(true)}
    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
    type='button'
  >
    Check Registration Status
  </button>
</div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Hotel Name
          </label>
          <input
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            type="text"
            placeholder="Enter hotel name"
            value={hoteld.hotelName}
            onChange={(e) => handlechange("hotelName", e.target.value)}
          />
          {errors.hotelName && (
            <p className="text-xs text-red-600 mt-1">{errors.hotelName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            rows={3}
            placeholder="Brief description of the hotel"
            value={hoteld.description}
            onChange={(e) => handlechange("description", e.target.value)}
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Address
          </label>
          <input
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            type="text"
            placeholder="Street address"
            value={hoteld.Address}
            onChange={(e) => handlechange("Address", e.target.value)}
          />
          {errors.Address && (
            <p className="text-xs text-red-600 mt-1">{errors.Address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            City
          </label>
          <select
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={hoteld.CityId}
            onChange={(e) => handlechange("CityId", e.target.value)}
          >
            <option value="" disabled>
              Select city
            </option>
            {cityoptions}
          </select>
          {errors.CityId && (
            <p className="text-xs text-red-600 mt-1">{errors.CityId}</p>
          )}
        </div>

       {role==="superadmin" && <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Admin
          </label>
          <select
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={hoteld.admin_id}
            onChange={(e) => handlechange("admin_id", e.target.value)}
          >
            <option value="" disabled>
              Select city
            </option>
            {adminoptions}
          </select>
          {errors.admind && (
            <p className="text-xs text-red-600 mt-1">{errors.adminid}</p>
          )}
        </div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Price Per Night
            </label>
            <input
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2500"
              value={hoteld.pricePerNight}
              onChange={(e) => handlechange("pricePerNight", e.target.value)}
            />
            {errors.pricePerNight && (
              <p className="text-xs text-red-600 mt-1">{errors.pricePerNight}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total Rooms
            </label>
            <input
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              type="number"
              min="0"
              placeholder="e.g. 40"
              value={hoteld.totalRooms}
              onChange={(e) => handlechange("totalRooms", e.target.value)}
            />
            {errors.totalRooms && (
              <p className="text-xs text-red-600 mt-1">{errors.totalRooms}</p>
            )}
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Available rooms will default to this value.
            </p>
          </div>
        </div>

        <div
  className={`rounded-lg border px-4 py-3 ${
    errors.hotelEmail
      ? "border-red-500"
      : "border-slate-300 dark:border-slate-700"
  } bg-white dark:bg-slate-800`}
>
  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
    Email address
  </label>

  <div className="flex gap-2">
    <input
      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      type="email"
      name="hotelEmail"
      value={hoteld.hotelEmail}
      onChange={(e) => handlechange(e.target.name, e.target.value)}
      placeholder="Enter email"
      disabled={emailVerified && role!=="superadmin"}
    />

    {emailVerified ? (
      <button
        type="button"
        className="rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white cursor-default"
      >
        Verified
      </button>
    ) : (
      <button
        type="button"
        onClick={()=>{
          handleemailsendotp()
        }}
        disabled={!hoteld.hotelEmail}
     Sendins   className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        verify
      </button>
    )}
  </div>

  {errors.hotelEmail && (
    <p className="mt-1 text-sm text-red-500">{errors.hotelEmail}</p>
  )}
</div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Hotel Phone
          </label>
          <input
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            type="tel"
            placeholder="+91 000000000"
            value={hoteld.hotelPhone}
            onChange={(e) => handlechange("hotelPhone", e.target.value)}
          />
          {errors.hotelPhone && (
            <p className="text-xs text-red-600 mt-1">{errors.hotelPhone}</p>
          )}
        </div>

        <div>
  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
    Hotel Image
  </label>

  <input
    type="file"
    accept="image/*"
    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:hover:bg-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    onChange={(e) =>
      handlechange("hotelImage", e.target.files[0])
    }
  />

  {errors.hotelImage && (
    <p className="mt-1 text-xs text-red-600">
      {errors.hotelImage}
    </p>
  )}

  {hoteld.hotelImage || hoteld.images && (
    <img
       src={hoteld.images || URL.createObjectURL(hoteld.hotelImage)
    }
      alt="Preview"
      className="mt-3 h-40 w-full rounded-lg border object-cover"
    />
  )}
</div>

        <button
          type="submit"
          disabled={submitting || !emailVerified}
          className="w-full cursor-pointer rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:disabled:bg-indigo-900"
        >
          {submitting ? "Adding..." : (hoteld._id) ? "Request to update Hotel" : (!emailVerified) ?  "please verify email first"   : "Request to Add Hotel" }
        </button>
      </form>
      </div>
    </div>
  );
}

export default Hoteladdform;
