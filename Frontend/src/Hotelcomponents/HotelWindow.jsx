import React, { useState } from 'react'
import HotelRoommanage from './HotelRoommanage'
import Hotelsidebar from './Hotelsidebar'
import HotelBooking from './HotelBooking'
import Hoteldashboard from './Hoteldashboard'

function HotelWindow() {
    const [activetab,setactivetab]=useState("dashboard")

  return (
    <div className='flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950'>


    <Hotelsidebar setactivetab={setactivetab} />

     <main className='min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8'>
     {activetab==="dashboard" && <Hoteldashboard />}
     {activetab==="rooms" && <HotelRoommanage />}
     {activetab==="bookings" && <HotelBooking />}
     </main>
    </div>
  )
}

export default HotelWindow