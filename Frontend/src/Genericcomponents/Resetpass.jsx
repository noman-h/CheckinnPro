import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import darkbg from '../assets/darkbg.jpg'
import lightbg from '../assets/lightbg.jpg'

function Resetpass() {

    
  const navigate=useNavigate()
  const [err,seterr]=useState({})

  const [resetd,setresetd]=useState({
    email:"",
    password:"",
    newpassword:"",
    confirmpassword:"",
  })


  const [submitting,setsubmitting]=useState(false)
  async function handlesubmit(e){

    e.preventDefault()
    const obj={}

    if(resetd.email==="") obj.email="email is required"
    if(resetd.password==="") obj.password="password is required"
     if(resetd.newpassword==="") obj.newpassword="password is required"
    if(resetd.confirmpassword==="") obj.confirmpassword="password is required"

    if(Object.keys(obj).length===0 &&
    resetd.newpassword===resetd.confirmpassword){
        
        if(resetd.newpassword !==resetd.password){
                   setsubmitting(true)
               try{
                const token=localStorage.getItem("token")
         const result=await axios.patch(`${import.meta.env.VITE_API_URL}/user/resetpass`,resetd,{headers:{
              Authorization:`Bearer ${token}`
            }})
      
   
               setresetd({
    email:"",
    password:"",
    newpassword:"",
    confirmpassword:""
  })
alert(result?.data?.message)
localStorage.removeItem("token")
navigate('/login')        
        
    }
    catch(err){
        
        if(err.status===404){
            obj.email="email not found"
        }
        if(err.status===401){
          obj.password="wrong password"

      }
    }
    finally{
      setsubmitting(false)
    }
        }
     else {
        obj.newpassword="new password is same as old password"
     }   
    
    }
    else {
         obj.confirmpassword="confirm password is not same as new password"
    }
    seterr(obj)
  }

  return (
     <section
      className="auth-background mx-auto flex min-h-screen max-h-[calc(100vh-4rem)] max-w-full items-center justify-center bg-cover bg-center px-4 py-12 sm:px-6"
      style={{ "--light-auth-background": `url(${lightbg})`, "--dark-auth-background": `url(${darkbg})` }}
     >
      
      <div className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20'>
         <form action="" className='flex w-full flex-col gap-5' onSubmit={handlesubmit}>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-slate-950 dark:text-white'>Reset password</h1>
            <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>Confirm your current password before changing it.</p>
          </div>


           <div className='flex flex-col'>
          <label htmlFor="" className='mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'>Email</label>
          <input value={resetd.email} onChange={(e)=>setresetd({...resetd,email:e.target.value})} type="text"  className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'/>
          <p className='mt-1 text-sm font-semibold text-rose-500'>{err.email}</p>
           </div>

           <div className='flex flex-col'>
          <label htmlFor="" className='mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'>Password</label>
          <input value={resetd.password} onChange={(e)=>setresetd({...resetd,password:e.target.value})}  type="password"  className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'/>
           <p className='mt-1 text-sm font-semibold text-rose-500'>{err.password}</p>
          </div>

          <div className='flex flex-col'>
          <label htmlFor="" className='mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'>New Password</label>
          <input value={resetd.newpassword} onChange={(e)=>setresetd({...resetd,newpassword:e.target.value})}  type="password"  className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'/>
           <p className='mt-1 text-sm font-semibold text-rose-500'>{err.newpassword}</p>
          </div>

          <div className='flex flex-col'>
          <label htmlFor="" className='mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'>Confirm Password</label>
          <input value={resetd.confirmpassword} onChange={(e)=>setresetd({...resetd,confirmpassword:e.target.value})}  type="password"  className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white'/>
           <p className='mt-1 text-sm font-semibold text-rose-500'>{err.confirmpassword}</p>
          </div>

          <button className='w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' disabled={submitting}>{(submitting) ? "Resetting.." : "Reset password"}</button>
         </form>
      </div>
    </section>
  )
}

export default Resetpass
