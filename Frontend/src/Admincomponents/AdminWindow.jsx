import React, { useState } from 'react'
import Adminsidebar from './Adminsidebar'
import AdminHotelsmanage from './AdminHotelsmanage'
import Coupansmanage from './Coupansmanage'
import AdminRoommanage from './AdminRoommanage'
import Adminbookings from './Adminbookings'
import AdminDashboard from './AdminDashboard'



function AdminWindow() {

  const [activetab,setactivetab]=useState("dashboard")

  
  return (
    <div className='flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950'>
    

    <Adminsidebar activetab={activetab} setactivetab={setactivetab} />

     <main className='min-w-0 flex-1 overflow-y-scroll overflow-x-hidden p-4 sm:p-6 lg:p-8'>
     {activetab==="dashboard" && <AdminDashboard />}
     {activetab==="hotels" && <AdminHotelsmanage />}
     {activetab==="coupans" && <Coupansmanage />}
     {activetab==="rooms" && <AdminRoommanage />}
     {activetab==="bookings" && <Adminbookings />}
     </main>
    </div>
  )
}

export default AdminWindow
