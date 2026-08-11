import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import darkbg from '../assets/darkbg.jpg'
import lightbg from '../assets/lightbg.jpg'

function Login() {
     
     const navigate=useNavigate()

    const [logind,setlogind]=useState({
        email:"",
        password:""
    })

    const [notific,setnotific]=useState("")

    const [err,seterr]=useState({})

    async function handlelogin(e){
          e.preventDefault()   

          const errobj={}
          
          
          if(logind.email===""){
            errobj.email="email is required"
          }
          if(logind.password===""){
            errobj.password="password is required"
          }

          seterr(errobj)

         if(Object.keys(errobj).length===0){
            try{
            const result=await axios.post('http://localhost:8080/user/login',{...logind})
            console.log(result);
            
            if(result.status===200){
              setnotific("login successfully")
              
              const token = result?.data?.token;
        const role = result?.data?.user?.role;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("email", logind.email);
          localStorage.setItem("theme", result?.data?.user?.theme); 
          localStorage.setItem("user", role);

          if(role==="superadmin"){
            navigate('/superadmindashboard')
          }
          else if(role==="admin"){
            navigate('/admindashboard')
          }
          else if(role==="hotel"){
            localStorage.setItem('userid',result?.data?.user?._id)
            navigate('/hoteldashboard')
          }
          else{
            localStorage.setItem('userid',result?.data?.user?._id)
            navigate('/')
          }

          window.dispatchEvent(new Event('authChange'));
          
          alert("logined successfully");
             setlogind({
        email:"",
        password:""
            })
            
            } 
            
          }
        }
          catch(err){
          
            if (err.status === 404) {
          errobj.email = "email not found";
        } else if (err.status === 400) {
          errobj.password = "wrong password";
        } else {
            setnotific(err?.response?.data?.message || err.message)
        }
          }
         }  
    }


    function handlechange(name,value){
         setlogind({...logind,[name]:value})
    }

  return (
    <section
      className="auth-background mx-auto flex min-h-screen max-h-[calc(100vh-4rem)] max-w-full items-center justify-center bg-cover bg-center px-4 py-12 sm:px-6"
      style={{ "--light-auth-background": `url(${lightbg})`, "--dark-auth-background": `url(${darkbg})` }}
    >
      <button onClick={()=>navigate('/adminaddform')} className="fixed bottom-5 left-5 mt-4 cursor-pointer rounded-lg border border-white/70 bg-white/90 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-indigo-300 dark:hover:bg-slate-800">Request to Register As HotelOwner</button>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Log in to your account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter your details to continue.</p>
        </div>
        {notific && <p className="mb-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{notific}</p>}
        <form action="" onSubmit={handlelogin} className="space-y-5">
          
            <div>
  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Email address</label>
            <input type='email' name="email" id="email" 
            onChange={(e)=>handlechange(e.target.name,e.target.value)}
            value={logind.email}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            {err.email && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{err.email}</p>}
            </div>
   
            <div>
  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input type="text" name="password" id="password" 
            value={logind.password}
            onChange={(e)=>handlechange(e.target.name,e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/>
            {err.password && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{err.password}</p>}
            </div>
          
          <button type='submit' className="cursor-pointer w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Log in</button>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">Don't have an account? 
            <button onClick={()=>navigate('/singup')}
            type='button'
            className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Sign up</button></div>

          <div className="text-center text-xl">
            <button onClick={()=>navigate('/forget')}
            type='button'
            className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Forget password</button></div>

          <div className="flex items-center gap-3 text-xs text-slate-400 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200 dark:text-slate-500 dark:before:bg-slate-700 dark:after:bg-slate-700">or</div>
          <div className="rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Google login</div>
        </form>
      </div>
      
    </section>
  )
}

export default Login
