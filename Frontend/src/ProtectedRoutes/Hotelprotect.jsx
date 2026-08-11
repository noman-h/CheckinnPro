import React from 'react'
import { Navigate } from 'react-router-dom'

function Hotelprotect({children}) {
  const token=localStorage.getItem("token")
    const role=localStorage.getItem('user')

     if(token && role==="hotel") return children
    else if(token && role==="superadmin")return <Navigate to='/superadmindashboard' />
    else if(token && role==="admin")return <Navigate to='/admindashboard' />
    else if(token && role==="user")return <Navigate to='/' />
    else {
       return <Navigate to='/login'/>
    }
}

export default Hotelprotect