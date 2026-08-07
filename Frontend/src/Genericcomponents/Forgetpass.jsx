import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import darkbg from '../assets/darkbg.jpg'
import lightbg from '../assets/lightbg.jpg'

function Forgetpass() {

  const navigate=useNavigate()
  const [err,seterr]=useState({})



  const [activesec,setactivesec]=useState("email")

  const [notific,setnotific]=useState("")
  const [forgetd,setforgetd]=useState({
    email:"",
    otp:"",
    newpassword:"",
    confirmpassword:"",
  })

  const [sendingotp,setsendingotp]=useState(false)
  const [verifyingotp,setverifyingotp]=useState(false)
  const [submitting,setsubmitting]=useState(false)
  async function handlesendotp() {
     const obj={}

     if(forgetd.email==="") obj.email="email is required"
    
      if(Object.keys(obj).length===0){
       setsendingotp(true)
     try{
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/user/forgetotpsend`,{...forgetd})
        console.log(result);
        
       if(result.status===200){
         setactivesec("otp")
        setnotific("otp send successfull")
       } 
    }
    catch(err){
      if(err.status===404){
        obj.email="email not found"
      }
      if(err.status===400){
         obj.otp="otp send failed"
      }
    }finally{
      setsendingotp(false)
    }
    }
    seterr(obj)
  }



  async function handleverifyotp() {
     const obj={}

     if(forgetd.otp==="") obj.otp="otp is required"

      if(Object.keys(obj).length===0){
        setverifyingotp(true)
     try{
      
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/user/forgetotpverify`,forgetd)
        if(result.status===200){
          setactivesec("password")
           setnotific("otp verified successfully")
        }
       
    }
    catch(err){      
      if(err.status===401){
        obj.otp="wrong otp"
      }
      if(err.status===403){
        obj.otp="otp expired"
      }
    }finally{
      setverifyingotp(false)
    }
    }
    seterr(obj)
  }
  

  

  async function handlesubmit(e){

    e.preventDefault()
    const obj={}

    
    if(forgetd.newpassword==="") obj.password="password is required"
    if(forgetd.confirmpassword==="") obj.password="password is required"
    
    if(Object.keys(obj).length===0 &&
     forgetd.confirmpassword===forgetd.newpassword ){
      setsubmitting(true)
     try{
      
        const result=await axios.patch(`${import.meta.env.VITE_API_URL}/user/forgetpass`,forgetd)

       setforgetd({
    email:"",
    expiretime:"",
    otp:"",
    newpassword:"",
    confirmpassword:""
  })
   setnotific(result?.data?.message)
   setTimeout(()=>{
     navigate('/login')
   },2000)
       
    }
    catch(err){
      if(err.status===404){
        obj.email="email not found"
      }
    }finally{
      setsubmitting(false)
    }
    }
    else {
        obj.confirmpassword="confirm password is not same as new password"
    }
    seterr(obj)
  }

  useEffect(()=>{
    if(notific){
      setTimeout(() => {
        setnotific("")
      }, 3000);
    }
  },[notific])

  return (
    <div
      className='auth-background flex min-h-screen max-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-y-auto bg-cover bg-center px-4 py-12 sm:px-6'
      style={{ "--light-auth-background": `url(${lightbg})`, "--dark-auth-background": `url(${darkbg})` }}
    >
      
      <div className='flex w-full max-w-md items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20'>
         <form action="" className='flex w-full flex-col gap-5' onSubmit={handlesubmit}>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-slate-950 dark:text-white'>Recover password</h1>
            <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>Create a new password for your account.</p>
          </div>

        {(activesec==="email") && 
      
              <div className='flex flex-col'>
          <label htmlFor="" className='mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'>Email</label>
          <input value={forgetd.email} onChange={(e)=>setforgetd({...forgetd,email:e.target.value})} type="text"  className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'/>
          <p className='mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400'>{err.email}</p>
          <button type='button' onClick={()=>handlesendotp()} className='mt-4 w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ' disabled={sendingotp}>{(sendingotp) ? "Recovering..." : "Recover password"}</button>
           </div>
}
          {(activesec==="otp") &&
           <div className='flex flex-col'>
          <label htmlFor="" className='mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'>Enter 4 digit-Otp</label>
          <input value={forgetd.otp} onChange={(e)=>setforgetd({...forgetd,otp:e.target.value})} type="text"  className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'/>
          <p className='mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400'>{err.otp}</p>
          <button type='button' onClick={()=>setactivesec("email") } className='mt-4 cursor-pointer text-left text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400'>edit email</button>
          <button type='button' onClick={()=>handleverifyotp()} className='mt-4 w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' disabled={verifyingotp}>{(verifyingotp) ? "verifying" : "verify otp"}</button>

          <button type='button' onClick={()=>handlesendotp()} className='mt-3 cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400' disabled={sendingotp}>{(sendingotp) ? "sending otp..." : "resend otp"}</button>
           </div>
       }
          

    {(activesec==="password") && <div className='space-y-5'>
          <div className='flex flex-col'>
          <label htmlFor="" className='mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'>New Password</label>
          <input value={forgetd.newpassword} onChange={(e)=>setforgetd({...forgetd,newpassword:e.target.value})}  type="password"  className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'/>
           <p className='mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400'>{err.newpassword}</p>
          </div>

          <div className='flex flex-col'>
          <label htmlFor="" className='mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'>Confirm Password</label>
          <input value={forgetd.confirmpassword} onChange={(e)=>setforgetd({...forgetd,confirmpassword:e.target.value})}  type="password"  className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'/>
           <p className='mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400'>{err.confirmpassword}</p>
          </div>
          <button className='w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' disabled={submitting}>{(submitting) ? "forgetting..." : "Forget password"}</button>
          </div>
}         

         </form>
      </div>
         <p className='mt-5 text-center text-sm font-medium text-emerald-700 dark:text-emerald-300'>{notific}</p>
    </div>
  )
}

export default Forgetpass
