import React from 'react'
import { Navigate } from 'react-router-dom'

function Adminprotect({children}) {

   const token=localStorage.getItem("token")
    const role=localStorage.getItem('user')

   if(token && role==="admin") return children
    else if(token && role==="superadmin")return <Navigate to='/superadmindashboard' />
    else if(token && role==="hotel")return <Navigate to='/hoteldashboard' />
    else if(token && role==="user")return <Navigate to='/' />
    else {
       return <Navigate to='/login'/>
    }
}

export default Adminprotect