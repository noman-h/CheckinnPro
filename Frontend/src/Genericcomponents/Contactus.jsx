import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
} from "lucide-react";

function Contactus() {
  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">

        {/* Background Effects */}
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute -right-32 top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 md:px-8">

          {/* Badge */}
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            <MessageSquare size={17} />
            We'd Love to Hear From You
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Contact{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Us
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            Have a question about CheckInnPro or need assistance?
            Our team is here to help you with your hotel management
            and booking needs.
          </p>

        </div>
      </section>


      {/* ================= CONTACT INFORMATION ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8 lg:py-20">

        <div className="grid gap-10 md:grid-cols-2">

          {/* ================= LEFT CONTENT ================= */}
          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Get In Touch
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Let's Talk
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-slate-600 dark:text-slate-400">
              Whether you have a question about our platform, need
              assistance with your booking, or want to share your
              feedback, we're here to help.
            </p>


            {/* Contact Cards */}
            <div className="mt-8 space-y-4">

              <ContactInfo
                icon={<Mail />}
                title="Email"
                value="support@checkinnpro.com"
              />

              <ContactInfo
                icon={<Phone />}
                title="Phone"
                value="+91 00000 00000"
              />

              <ContactInfo
                icon={<MapPin />}
                title="Location"
                value="Rajasthan, India"
              />

              <ContactInfo
                icon={<Clock />}
                title="Working Hours"
                value="Monday - Friday, 9:00 AM - 6:00 PM"
              />

            </div>

          </div>


          {/* ================= RIGHT CARD ================= */}
          <div className="flex items-center">

            <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              {/* Icon */}
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <MessageSquare size={26} />
              </div>

              {/* Heading */}
              <h3 className="mt-6 text-center text-xl font-bold">
                We're Here to Help
              </h3>

              {/* Text */}
              <p className="mt-3 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
                Have questions about CheckInnPro? Feel free to
                contact our support team. We are always happy to
                assist you with your questions and concerns.
              </p>

              {/* Email Button */}
              <a
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Mail size={17} />
                Contact Support
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* ================= SUPPORT SECTION ================= */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">

        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6">

          {/* Icon */}
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <MessageSquare size={23} />
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Need Help With Your Booking?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Our support team is ready to help you with booking
            questions, account issues, hotel information, or any
            other CheckInnPro-related queries.
          </p>

          <a
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            <Mail size={17} />
            Email Support
          </a>

        </div>

      </section>

    </div>
  );
}


/* ================= CONTACT INFO COMPONENT ================= */

function ContactInfo({ icon, title, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40">

      {/* Icon */}
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        {React.cloneElement(icon, { size: 20 })}
      </div>

      {/* Content */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {value}
        </p>
      </div>

    </div>
  );
}

export default Contactus;