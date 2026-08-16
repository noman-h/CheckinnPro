import React from "react";
import { Mail, MapPin, Phone, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-slate-200/80 bg-white/80 text-slate-600 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div
              onClick={() => navigate("/")}
              className="inline-flex cursor-pointer items-center gap-2"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                C
              </div>

              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                CheckIn<span className="text-indigo-600">Pro</span>
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              A modern Hotel Management and Booking System designed to simplify
              hotel operations and provide a smooth and reliable booking
              experience.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <CalendarCheck size={17} />
              <span>Manage Hotels. Simplify Bookings.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Home
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigate("/")}
                  className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Hotels
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigate("/about")}
                  className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  About Us
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Contact
            </h3>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail
                  size={17}
                  className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                />
                <span>support@checkinnpro.com</span>
              </li>

              <li className="flex items-start gap-3">
                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                />
                <span>+91 00000 00000</span>
              </li>

              <li className="flex items-start gap-3">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                />
                <span>Rajasthan, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-slate-200 dark:bg-slate-800" />

        {/* Bottom */}
        <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              CheckInnPro
            </span>
            . All rights reserved.
          </p>

          <div className="flex gap-5">
            <button
              onClick={() => navigate("/privacy")}
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Privacy Policy
            </button>

            <button
              onClick={() => navigate("/terms")}
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
