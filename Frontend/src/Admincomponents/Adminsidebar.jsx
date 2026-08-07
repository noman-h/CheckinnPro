import React from "react";

function Adminsidebar({ setactivetab, activetab }) {
  const menuClass = (tab) =>
   `rounded-lg px-3 py-2.5 text-left text-sm font-medium transition
    ${
      activetab === tab
        ?  "bg-indigo-600 text-white shadow-md dark:bg-indigo-500 dark:text-white"
        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
    }`;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-8 border-b border-slate-200 px-3 pb-5 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
          Hotel Admin
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
          Management
        </h2>
      </div>

      <nav className="flex flex-col gap-1">
        <button
          className={menuClass("dashboard")}
          onClick={() => setactivetab("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={menuClass("hotels")}
          onClick={() => setactivetab("hotels")}
        >
          Hotels
        </button>

        <button
          className={menuClass("coupans")}
          onClick={() => setactivetab("coupans")}
        >
          Coupans
        </button>

        <button
          className={menuClass("rooms")}
          onClick={() => setactivetab("rooms")}
        >
          Rooms
        </button>

        <button
          className={menuClass("bookings")}
          onClick={() => setactivetab("bookings")}
        >
          Bookings
        </button>
      </nav>
    </aside>
  );
}

export default Adminsidebar;