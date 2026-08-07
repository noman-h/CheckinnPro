import React from 'react'
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { tab: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { tab: "rooms",     label: "Rooms",     icon: BedDouble },
  { tab: "bookings",  label: "Bookings",  icon: CalendarCheck },
]

function Hotelsidebar({ setactivetab, activetab, collapsed, onToggle }) {
  return (
    <aside
      className={`sidebar-base ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"} p-3`}
    >
      {/* Brand */}
      <div
        className={`mb-6 flex items-center border-b border-slate-200 pb-4 dark:border-slate-800 ${
          collapsed ? "justify-center px-0" : "justify-between px-1"
        }`}
      >
        {!collapsed && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Hotel Admin
            </p>
            <h2 className="mt-0.5 text-base font-bold text-slate-950 dark:text-white">
              Management
            </h2>
          </div>
        )}

        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ tab, label, icon: Icon }) => {
          const isActive = activetab === tab;
          return (
            <div key={tab} className="group relative">
              <button
                onClick={() => setactivetab(tab)}
                title={collapsed ? label : undefined}
                className={`sidebar-item ${
                  isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>

              {collapsed && (
                <span className="sidebar-tooltip">{label}</span>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  )
}

export default Hotelsidebar
