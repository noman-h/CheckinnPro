import React, { useState } from 'react'
import HotelRoommanage from './HotelRoommanage'
import Hotelsidebar from './Hotelsidebar'
import HotelBooking from './HotelBooking'
import Hoteldashboard from './Hoteldashboard'
import { Menu } from 'lucide-react'

function HotelWindow() {
  const [activetab, setactivetab] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='relative flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950'>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-sm lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transition-transform duration-300
          lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Hotelsidebar
          activetab={activetab}
          setactivetab={(tab) => { setactivetab(tab); setSidebarOpen(false) }}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main content */}
      <main className='min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 will-change-scroll [transform:translateZ(0)]'>

        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className='hamburger-btn'
        >
          <Menu size={16} />
          Menu
        </button>

        {activetab === "dashboard" && <Hoteldashboard />}
        {activetab === "rooms"     && <HotelRoommanage />}
        {activetab === "bookings"  && <HotelBooking />}
      </main>
    </div>
  )
}

export default HotelWindow