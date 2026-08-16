import React from "react";
import {
  Building2,
  ShieldCheck,
  Users,
  CalendarCheck,
  Upload,
  Cloud,
  Mail,
  CheckCircle2,
  Hotel,
  MapPin,
} from "lucide-react";

function AboutUs() {
  const features = [
    {
      icon: <Hotel size={22} />,
      title: "Hotel Management",
      description:
        "Manage hotels, rooms, facilities, and hotel information from one platform.",
    },
    {
      icon: <CalendarCheck size={22} />,
      title: "Smart Booking",
      description:
        "Provide customers with a smooth and reliable room booking experience.",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Secure Access",
      description:
        "JWT authentication and role-based permissions protect platform access.",
    },
    {
      icon: <Upload size={22} />,
      title: "Bulk Import",
      description:
        "Import hotel information from Excel files directly into the system.",
    },
    {
      icon: <Cloud size={22} />,
      title: "Cloud Images",
      description:
        "Store and manage hotel and room images efficiently using Cloudinary.",
    },
    {
      icon: <Mail size={22} />,
      title: "Email Notifications",
      description:
        "Send important booking and account notifications through email.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-32 top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 md:px-8 lg:py-24">

          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Building2 size={17} />
            Hotel Management & Booking System
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            About{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              CheckInnPro
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            CheckInnPro is a modern Hotel Management and Booking System
            designed to simplify hotel operations, manage rooms efficiently,
            and provide customers with a seamless booking experience.
          </p>

        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 lg:py-20">

        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Text */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Who We Are
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Making Hotel Management Simple
            </h2>

            <p className="mt-5 leading-7 text-slate-600 dark:text-slate-400">
              CheckInnPro brings customers, hotel managers, administrators,
              and super administrators together on a single platform.
            </p>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
              From hotel registration and room management to reservations,
              approvals, and user management, CheckInnPro helps streamline
              the complete hotel management workflow.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Easy hotel and room management",
                "Secure and reliable booking system",
                "Role-based access control",
                "Centralized hotel information",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-indigo-600 dark:text-indigo-400"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Card */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-3xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    CheckInnPro
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Hotel Management
                  </h3>
                </div>

                <div className="grid size-12 place-items-center rounded-xl bg-indigo-600 text-white">
                  <Building2 size={24} />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <Hotel
                    size={21}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  <p className="mt-3 text-lg font-bold">Hotels</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Manage properties
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <CalendarCheck
                    size={21}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  <p className="mt-3 text-lg font-bold">Bookings</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Manage reservations
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <Users
                    size={21}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  <p className="mt-3 text-lg font-bold">Users</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Manage accounts
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <MapPin
                    size={21}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  <p className="mt-3 text-lg font-bold">Locations</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Organize properties
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Our Mission
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Smarter Hotel Operations
            </h2>

            <p className="mt-5 leading-7 text-slate-600 dark:text-slate-400">
              Our goal is to make hotel management easier for administrators
              and hotel managers while giving customers a simple, secure,
              and convenient way to discover and book rooms.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <InfoCard
              icon={<ShieldCheck />}
              title="Secure"
              text="Secure authentication and role-based permissions help protect user and hotel data."
            />

            <InfoCard
              icon={<Users />}
              title="User Friendly"
              text="Clean and responsive interfaces provide an easy experience across different user roles."
            />

            <InfoCard
              icon={<CalendarCheck />}
              title="Reliable"
              text="The booking system is designed to prevent duplicate room reservations."
            />

          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 lg:py-20">

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Platform Features
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Everything You Need
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            CheckInnPro provides essential tools for managing hotels,
            rooms, bookings, users, and hotel data.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50"
            >

              <div className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400">
                {feature.icon}
              </div>

              <h3 className="mt-5 font-semibold">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>

            </div>
          ))}

        </div>
      </section>

      {/* ================= TECHNOLOGY ================= */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">

        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 md:px-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Technology
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Built With Modern Technology
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            {[
              "React.js",
              "Node.js",
              "Express.js",
              "MongoDB",
              "Mongoose",
              "JWT",
              "Cloudinary",
              "Brevo API",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              >
                {tech}
              </span>
            ))}

          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">

        <div className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-indigo-50 px-6 py-14 text-center dark:border-indigo-500/20 dark:bg-indigo-500/5 sm:px-12">

          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Experience CheckInnPro
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Manage hotels, simplify bookings, and create a better
              hospitality experience with CheckInnPro.
            </p>

            <a
              href="/"
              className="mt-8 inline-flex rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Explore Hotels
            </a>
          </div>

        </div>

      </section>

    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        {React.cloneElement(icon, { size: 24 })}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
}

export default AboutUs;


