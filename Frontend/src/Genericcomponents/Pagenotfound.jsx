import React from 'react'
import { useNavigate } from 'react-router-dom';

function Pagenotfound() {

    const navigate = useNavigate();

  return (
     <section
      className="auth-background mx-auto flex min-h-screen max-h-[calc(100vh-4rem)] max-w-full items-center justify-center bg-cover bg-center px-4 py-12 sm:px-6"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

        <div className="mb-6">
          <h1 className="text-8xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            404
          </h1>

          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
        </div>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Oops!
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Page Not Found
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="space-y-3">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go to Home
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Go Back
          </button>

        </div>

        <div className="mt-8 flex items-center gap-3 text-xs text-slate-400 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200 dark:text-slate-500 dark:before:bg-slate-700 dark:after:bg-slate-700">
          CheckInnPro
        </div>

      </div>
    </section>
  )
}

export default Pagenotfound