import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Adminaddform() {

const navigate=useNavigate()
const BASE_URL=import.meta.env.VITE_API_URL

const {adminid}=useParams()



const role=localStorage.getItem('user')
  const [citydata, setcitydata] = useState([]);

  const [submitting, setsubmitting] = useState(false);
const [successmsg, setsuccessmsg] = useState("");

 

  async function fetchcity() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/location/getallcity`,
      );
      
      setcitydata(result?.data?.response || []);
    } catch (err) {
      console.log(err);
    }
  }

  const [checkstatus,setcheckstatus]=useState(false)
  const [showcheckdata,setshowcheckdata]=useState(false)
  const [checkid,setcheckid]=useState("")
  const [checkdata,setcheckdata]=useState(null)
  async function handlecheck() {
         try{
            const result = await axios.get(`${BASE_URL}/admin/getcheckone/${checkid}`);

            if(result.status===200){
              setcheckstatus(false)
              setshowcheckdata(true)
              setcheckid("")
              setcheckdata(result?.data?.response);
            }
         }
         catch(err){
          alert(err?.response?.data?.message)
          console.log(err.response);
         }
  }

   const [notific,setnotific]=useState("")
  const [showOtpModal,setshowOtpModal]=useState(false)
  const [otp,setotp]=useState("")
  const [otpsending,setotpsending]=useState(false)
  const [otpverifying,setotpverifying]=useState(false)
  const [err,seterr]=useState("")

  async function handlesendotp() {
    const obj={}

     setotpsending(true)
     try{
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/admin/adminotpsend`,{email:checkdata.owneremail})
       
        
       if(result.status===200){
         setnotific("otp send successfull")
       } 
    }
    catch(err){
      console.log(err);
      
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
   
  
     async function handleverifyotp() {
     const obj={}

     if(otp==="") obj.otp="otp is required"
       
      if(Object.keys(obj).length===0){
        setotpverifying(true)
     try{
      
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/admin/adminotpverify`,{email:checkdata.owneremail,otp})
        if(result.status===200){
           setOwnerData({...checkdata,cityId:checkdata?.cityId?._id})
           setemailVerified(true)
           setshowOtpModal(false)
           setnotific("otp verified successfully")
        }
       
    }
    catch(err){   
      console.log(err);
         
      if(err.status===401){
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

   const [emailVerified,setemailVerified]=useState( role==="superadmin" || false)
  const [showemailOtpModal,setshowemailOtpModal]=useState(false)
  async function handleemailsendotp() {
    const obj={}

    if (!ownerData.owneremail){ 
      obj.owneremail="Email is required"
      return
    }

    setotpsending(true)
    setshowemailOtpModal(true)
    console.log(ownerData.owneremail);
    
     try{
        const result=await axios.post(`${import.meta.env.VITE_API_URL}/admin/adminemailotpsend`,{email:ownerData.owneremail})
        console.log("<<<",result);
        
       if(result.status===200){
         
         setnotific("otp send successfull")
       } 
    }
    catch(err){
      console.log(err.message);
      
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
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/admin/adminotpverify`,{email:ownerData.owneremail,otp})
        if(result.status===200){
           setemailVerified(true)
           setshowemailOtpModal(false)
           setnotific("otp verified successfully")
        }
       
    }
    catch(err){   
      console.log(err);
         
      if(err.status===401){
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

  async function fetchAdminData() {
  try {
    const token=localStorage.getItem('token')
    const result = await axios.get(
      `${BASE_URL}/admin/getoneadmin/${adminid}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    if (result.status === 200) {
      const data = result.data.response;

      setOwnerData({
        _id: data._id,
        ownername: data.ownername || "",
        owneremail: data.owneremail || "",
        ownerphone: data.ownerphone || "",
        cityId: data.cityId?._id || data.cityId || "",
        address: data.address || "",
        aadhaarNumber: data.aadhaarNumber || "",

        // Don't put existing image URLs into file fields
        profileImage: null,
        aadhaarFront: null,
        aadhaarBack: null,
      });
    }
  } catch (err) {
    console.log(err);

    seterrors({
      form:
        err?.response?.data?.message ||
        "Unable to load admin details.",
    });
  }
}


  useEffect(() => {
     if (adminid) {
    fetchAdminData();
  }

    fetchcity();
  }, [adminid]);



   const cityoptions = citydata.map((city) => {
      return  <option key={city._id} value={city._id}>
          {city.cityname}  ({city?.district_id?.districtname})  ({city.district_id?.state_id?.statename})  
          </option>
  });


    

  const [ownerData, setOwnerData] = useState({
    ownername: "",
    owneremail: "",
    ownerphone: "",
    cityId: "",
    address: "",
    aadhaarNumber: "",
    profileImage: null,
    aadhaarFront: null,
    aadhaarBack: null,
  });

  const [errors, seterrors] = useState({});

  const handleSubmit = async(e) => {
    e.preventDefault();

    const obj = {};

    if (!ownerData.ownername.trim()) obj.ownername = "Owner name is required";

    if (!ownerData.owneremail.trim()) obj.owneremail = "Email is required";
    else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(ownerData.owneremail)
    )
      obj.owneremail = "Invalid email";

    if (!ownerData.ownerphone.trim())
      obj.ownerphone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(ownerData.ownerphone))
      obj.ownerphone = "Invalid phone number";

    if (!ownerData.cityId) obj.cityId = "Please select a city";

    if (!ownerData.address.trim()) obj.address = "Address is required";

    if (!ownerData.aadhaarNumber.trim())
      obj.aadhaarNumber = "Aadhaar number is required";
    else if (!/^\d{12}$/.test(ownerData.aadhaarNumber))
      obj.aadhaarNumber = "Aadhaar must contain 12 digits";

    if (!ownerData.profileImage && !ownerData._id) obj.profileImage = "Profile image is required";

    if (!ownerData.aadhaarFront && !ownerData._id)
      obj.aadhaarFront = "Aadhaar front image is required";

    if (!ownerData.aadhaarBack && !ownerData._id)
      obj.aadhaarBack = "Aadhaar back image is required";


    seterrors(obj);
   
    if (Object.keys(obj).length === 0 && emailVerified) {
  
      // submit here
      if(ownerData._id){
        try {

      setsubmitting(true);      
      const formData = new FormData();

Object.keys(ownerData).forEach((key) => {
  formData.append(key, ownerData[key]);
});

const result=await axios.post(
  `${BASE_URL}/admin/updateadmin`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);
 
      if (result.status === 200) {
        setemailVerified(false)
        setsuccessmsg("ownerdetail Updated successfully.");
        setOwnerData({
           ownername: "",
    owneremail: "",
    ownerphone: "",
    cityId: "",
    address: "",
    aadhaarNumber: "",
    profileImage: null,
    aadhaarFront: null,
    aadhaarBack: null,
        });
      }
    } catch (err) {
      console.log(err);
      seterrors({
        form:
          err?.response?.data?.message ||
          "Something went wrong while updating the hotel.",
      });
    } finally {
      setsubmitting(false);
    }
    }

    // superadmin direct add
    else if(role==="superadmin"){


    try {
        setsubmitting(true);  
      const formData = new FormData();

Object.keys(ownerData).forEach((key) => {
  formData.append(key, ownerData[key]);
});

const result=await axios.post(
  `${BASE_URL}/admin/directaddadmin`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);
      if (result.status === 201) {
        setsuccessmsg("hotelowner Requested successfully.");
        setOwnerData({
          ownername: "",
    owneremail: "",
    ownerphone: "",
    cityId: "",
    address: "",
    aadhaarNumber: "",
    profileImage: null,
    aadhaarFront: null,
    aadhaarBack: null,
        });
      }
    } catch (err) {
      console.log(err.response);
      seterrors({
        form:
          err?.response?.data?.message ||
          "Something went wrong while adding the hotel.",
      });
    } finally {
      setsubmitting(false);
    }}
    else{


    try {
        setsubmitting(true);  
      const formData = new FormData();

Object.keys(ownerData).forEach((key) => {
  formData.append(key, ownerData[key]);
});

const result=await axios.patch(
  `${BASE_URL}/admin/addadmin`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);
      if (result.status === 201) {
        setemailVerified(false)
        setsuccessmsg("hotelowner Requested successfully.");
        setOwnerData({
          ownername: "",
    owneremail: "",
    ownerphone: "",
    cityId: "",
    address: "",
    aadhaarNumber: "",
    profileImage: null,
    aadhaarFront: null,
    aadhaarBack: null,
        });
      }
    } catch (err) {
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
  };

  function handlechange(name, value) {
    setOwnerData({ ...ownerData, [name]: value });

    if (errors[name]) {
      seterrors({ ...errors, [name]: "" });
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950">

   {/* update otp send */}
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
          Owner Email
        </label>

        <input
          type="email"
          value={checkdata.owneremail}
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
          placeholder="Enter 4-digit OTP"
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
            {otpsending ? "Sending..." : "send otp"}
        </button>

        <button
          type="button"
          onClick={()=>handleverifyotp()}
          disabled={otpsending}
          className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700"
        >
         {otpverifying ? "verifying..." : "Verify otp"}
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
          value={ownerData.owneremail}
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
          Owner Details
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
            Owner Name
          </span>
          <span className="text-gray-800 dark:text-white">
            {checkdata.ownername}
          </span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            Owner Email
          </span>
          <span className="text-gray-800 dark:text-white">
            {checkdata.owneremail}
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
        Check Registration Status
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
          type='button'
        >
          Check Status
        </button>
      </div>

    </div>
  </div>
)}

{successmsg && (
  <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
    {successmsg}
  </div>
)}

{errors.form && (
  <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
    {errors.form}
  </div>
)}

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
      >
        <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Hotel owner registration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Hotel owner details</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Provide the owner’s contact and verification details.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={()=>setcheckstatus(true)}
            >
              Check registration status
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-700"
              onClick={()=>navigate(-1)}
            >
              Go back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div
            className={`w-full rounded-lg border px-4 py-3 outline-none transition
${
  errors.ownername ? "border-red-500" : "border-slate-300 dark:border-slate-700"
}
bg-white dark:bg-slate-800 dark:text-white
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400`}
          >
            <label htmlFor="" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Owner name</label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              type="text"
              name="ownername"
              value={ownerData.ownername}
              onChange={(e) => handlechange(e.target.name, e.target.value)}
              id=""
            />
          {errors.ownername && (
            <p className="mt-1 text-sm text-red-500">{errors.ownername}</p>
          )}
          </div>

          <div
  className={`rounded-lg border px-4 py-3 ${
    errors.owneremail
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
      name="owneremail"
      value={ownerData.owneremail}
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
        disabled={!ownerData.owneremail}
     Sendins   className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        verify
      </button>
    )}
  </div>

  {errors.owneremail && (
    <p className="mt-1 text-sm text-red-500">{errors.owneremail}</p>
  )}
</div>

          <div
            className={`w-full rounded-lg border px-4 py-3 outline-none transition
${
  errors.ownerphone
    ? "border-red-500"
    : "border-slate-300 dark:border-slate-700"
}
bg-white dark:bg-slate-800 dark:text-white
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400`}
          >
            <label htmlFor="" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Phone number</label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              type="text"
              value={ownerData.ownerphone}
              name="ownerphone"
              onChange={(e) => handlechange(e.target.name, e.target.value)}
              id=""
            />
          {errors.ownerphone && (
            <p className="mt-1 text-sm text-red-500">{errors.ownerphone}</p>
          )}
          </div>

          <div
            className={`w-full rounded-lg border px-4 py-3 outline-none transition
${errors.cityId ? "border-red-500" : "border-slate-300 dark:border-slate-700"}
bg-white dark:bg-slate-800 dark:text-white
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400`}
          >
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">City</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              value={ownerData.cityId}
              onChange={(e) => handlechange("cityId", e.target.value)}
            >
              <option value="" disabled>
                Select city
              </option>
              {cityoptions}
            </select>
            {errors.cityId && (
              <p className="mt-1 text-sm text-red-500">{errors.cityId}</p>
            )}
          </div>

          <div
            className={`w-full rounded-lg border px-4 py-3 outline-none transition
${errors.address ? "border-red-500" : "border-slate-300 dark:border-slate-700"}
bg-white dark:bg-slate-800 dark:text-white
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400`}
          >
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Address
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              type="text"
              placeholder="Street address"
              value={ownerData.address}
              onChange={(e) => handlechange("address", e.target.value)}
            />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
          </div>

          <div
            className={`w-full rounded-lg border px-4 py-3 outline-none transition
${
  errors.aadhaarNumber
    ? "border-red-500"
    : "border-slate-300 dark:border-slate-700"
}
bg-white dark:bg-slate-800 dark:text-white
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400`}
          >
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Aadhaar number
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              type="text"
              placeholder="enter aadhar no."
              value={ownerData.aadhaarNumber}
              onChange={(e) => handlechange("aadhaarNumber", e.target.value)}
            />
          {errors.aadhaarNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.aadhaarNumber}</p>
          )}
          </div>

          <div
            className={`w-full rounded-lg border px-4 py-3 outline-none transition
${
  errors.profileImage
    ? "border-red-500"
    : "border-slate-300 dark:border-slate-700"
}
bg-white dark:bg-slate-800 dark:text-white
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400`}
          >
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Profile image
            </label>

            <input
              type="file"
              accept="image/*"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:hover:bg-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              onChange={(e) => handlechange("profileImage", e.target.files[0])}
            />
          {errors.profileImage && (
            <p className="mt-1 text-sm text-red-500">{errors.profileImage}</p>
          )}
          </div>

          <div
            className={`w-full rounded-lg border px-4 py-3 outline-none transition
${
  errors.aadhaarFront
    ? "border-red-500"
    : "border-slate-300 dark:border-slate-700"
}
bg-white dark:bg-slate-800 dark:text-white
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400`}
          >
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Aadhaar front image
            </label>

            <input
              type="file"
              accept="image/*"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:hover:bg-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              onChange={(e) => handlechange("aadhaarFront", e.target.files[0])}
            />
          {errors.aadhaarFront && (
            <p className="mt-1 text-sm text-red-500">{errors.aadhaarFront}</p>
          )}
          </div>

          <div
            className={`w-full rounded-lg border px-4 py-3 outline-none transition
${
  errors.aadhaarBack
    ? "border-red-500"
    : "border-slate-300 dark:border-slate-700"
}
bg-white dark:bg-slate-800 dark:text-white
focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400`}
          >
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Aadhaar back image
            </label>

            <input
              type="file"
              accept="image/*"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:hover:bg-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              onChange={(e) => handlechange("aadhaarBack", e.target.files[0])}
            />
          {errors.aadhaarBack && (
            <p className="mt-1 text-sm text-red-500">{errors.aadhaarBack}</p>
          )}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-indigo-600 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting || !emailVerified}
          >
          {submitting
  ? "Submitting..."
  : ownerData._id
  ? "Request to Update Owner"
  : (emailVerified) ? "Request to Add Owner" :
  "please verify email first" }
          </button>
        </div>
      </form>
    </div>
  );
}

export default Adminaddform;
