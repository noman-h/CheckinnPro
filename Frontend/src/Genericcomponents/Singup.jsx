import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import darkbg from '../assets/darkbg.jpg'
import lightbg from '../assets/lightbg.jpg'

function Singup() {
  
    const navigate=useNavigate()

    const [singupd,setsingupd]=useState({
        name:"",
        email:"",
        phone:"",
        password:""
    })

    const [notific,setnotific]=useState("")

    const [err,seterr]=useState({})

    async function handlesingup(e){
          e.preventDefault()   

          const errobj={}
          
          if(singupd.name===""){
            errobj.name="name is required"
          }
          if(singupd.email===""){
            errobj.email="email is required"
          }
          if(singupd.phone===""){
            errobj.phone="phone no. is required"
          }
          if(singupd.password===""){
            errobj.password="password is required"
          }

          seterr(errobj)

         if(Object.keys(errobj).length===0){
            try{
            const result=await axios.post('http://localhost:8080/user/singup',{...singupd})
            if(result.status===201){
              setnotific("user created successfully")

             setsingupd({
                 name:"",
        email:"",
        phone:"",
        password:""
            })
            
            } 
            
          }
          catch(err){
            setnotific(err?.response?.data?.message || err.message)
            console.log()
          }
         }  
    }


    function handlechange(name,value){
         setsingupd({...singupd,[name]:value})
    }

  return (
    <section
      className="auth-background mx-auto flex min-h-screen max-h-[calc(100vh-4rem)] max-w-full items-center justify-center bg-cover bg-center px-4 py-12 sm:px-6"
      style={{ "--light-auth-background": `url(${lightbg})`, "--dark-auth-background": `url(${darkbg})` }}
    >

      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/50">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">Get started today</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">A few details and you’ll be ready to go.</p>
        </div>
        {notific && <p className="mb-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{notific}</p>}

        <form action="" onSubmit={handlesingup} className="space-y-8">

             <div className='grid grid-cols-2  gap-6'>
            <div>
  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</label>
            <input type="text" name="name" id="name"  value={singupd.name} 
            onChange={(e)=>handlechange(e.target.name,e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/>
            {err.name && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{err.name}</p>}
            </div>

            <div>
  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Email address</label>
            <input type='email' name="email" id="email" 
            onChange={(e)=>handlechange(e.target.name,e.target.value)}
            value={singupd.email}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            {err.email && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{err.email}</p>}
            </div>

            <div>
  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Phone number</label>
            <input type="text" name="phone" id="phone" 
            value={singupd.phone}
            onChange={(e)=>handlechange(e.target.name,e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/>
            {err.phone && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{err.phone}</p>}
            </div>

            <div>
  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input type="text" name="password" id="password" 
            value={singupd.password}
            onChange={(e)=>handlechange(e.target.name,e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/>
            {err.password && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{err.password}</p>}
            </div>
         

          </div>

          <button type='submit' className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer">Create account</button>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">Already have an account? 
            <button onClick={()=>navigate('/login')}
            type='button'
            className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Log in</button></div>

          <div className="flex items-center gap-3 text-xs text-slate-400 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200 dark:text-slate-500 dark:before:bg-slate-700 dark:after:bg-slate-700">or</div>
          <div className="rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Google login</div>
        </form>
      </div>
    </section>
  )
}

export default Singup
