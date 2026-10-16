import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

function Usetheme() {

    const [theme,settheme]=useState(localStorage.getItem("theme") || 'dark')
  
    
    const token=localStorage.getItem("token")


    async function fetchtheme(){
        try{
 const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/changetheme`,{theme},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
       
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
        console.log(err); 
       }
        
    }
    
    useEffect(()=>{
        
        document.body.className=theme
        if(token){
            localStorage.setItem("theme",theme)
            fetchtheme()
        }
    },[theme])

    const toggletheme=()=>{
       
      (theme==='light') ? settheme('dark') : settheme('light')
    }

  return ({theme,toggletheme})
}

export default Usetheme


