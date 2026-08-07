import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Statemanage from './Statemanage';
import Districtmanage from './Districtmanage';
import Citymanage from './Citymanage';
import Hotelsmanage from './Hotelsmanage';
import Adminmanage from './Adminmanage';
import SuperAdminDashboard from './SuperAdminDashboard';
import { Menu } from 'lucide-react'

function SuperAdminWindow() {

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
        <Sidebar
          setactivetab={(tab) => { setactivetab(tab); setSidebarOpen(false) }}
          activetab={activetab}
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

        {activetab === "dashboard" && <SuperAdminDashboard />}
        {activetab === "states"    && <Statemanage />}
        {activetab === "districts" && <Districtmanage />}
        {activetab === "city"      && <Citymanage />}
        {activetab === "hotels"    && <Hotelsmanage />}
        {activetab === "admins"    && <Adminmanage />}
      </main>
    </div>
  )
}

export default SuperAdminWindow
