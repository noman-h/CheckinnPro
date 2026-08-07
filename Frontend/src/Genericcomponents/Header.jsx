import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Usetheme from '../Hooks/Usetheme';
import { User, LogOut, Calendar, LogIn, UserPlus } from 'lucide-react';

function Header() {
  const { theme, toggletheme } = Usetheme();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const userId = localStorage.getItem('userid');
  const userEmail = localStorage.getItem('email') || 'User Profile';
  const role = localStorage.getItem('user');

  useEffect(() => {
    setIsLoggedIn(!!userEmail);
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userid');
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex cursor-pointer items-center space-x-2 font-bold text-slate-900 dark:text-white"
        >
          <span className="text-xl tracking-tight">StaySync</span>
        </div>

        <nav className="flex items-center gap-3">

          {/* Theme Button */}
          <button
            onClick={toggletheme}
            className="grid size-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {theme === 'light' ? '☾' : '☀'}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">

              {role === "user" && (
                <button
                  onClick={() => navigate('/userbookings')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <Calendar size={16} />
                  My Bookings
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <User size={18} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="truncate text-sm font-semibold dark:text-white">
                        {userEmail}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-2">

              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <LogIn size={16} />
                Log In
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <UserPlus size={16} />
                Sign Up
              </button>

            </div>
          )}

        </nav>
      </div>
    </header>
  );
}

export default Header;