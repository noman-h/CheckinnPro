import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Statemanage from './Statemanage';
import Districtmanage from './Districtmanage';
import Citymanage from './Citymanage';
import Hotelsmanage from './Hotelsmanage';
import Adminmanage from './Adminmanage';
import SuperAdminDashboard from './SuperAdminDashboard';

function SuperAdminWindow() {

  const [activetab,setactivetab]=useState("dashboard")


  
  return (
    <div className='flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950'>


    <Sidebar setactivetab={setactivetab} activetab={activetab} />

     <main className='min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8'>
     {activetab==="dashboard" && <SuperAdminDashboard/>}
     {activetab==="states" && <Statemanage/>}
     {activetab==="districts" && <Districtmanage/>}
     {activetab==="city" && <Citymanage/>}
     {activetab==="hotels" && <Hotelsmanage/>}
     {activetab==="admins" && <Adminmanage/>}
     </main>
    </div>
  )
}

export default SuperAdminWindow
