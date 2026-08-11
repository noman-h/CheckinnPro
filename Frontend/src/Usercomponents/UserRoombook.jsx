import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import moment from 'moment';
import 'react-calendar/dist/Calendar.css';

import { 
  Wifi, Tv, Coffee, Car, Wind, Sparkles, 
  BedDouble, MapPin, Phone, Mail, Calendar as CalendarIcon, 
  Users, Building, X, Tag, AlertCircle, ArrowLeft 
} from 'lucide-react';

function UserRoombook() {


  const { roomid } = useParams();
  const navigate = useNavigate();
   const userId = localStorage.getItem("userid");

  const [roomdata, setroomdata] = useState({});
  const [bookingdata, setbookingdata] = useState([]);
  const [coupandata, setcoupandata] = useState([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [dateError, setDateError] = useState('');

  const token=localStorage.getItem('token')

  async function fetchroom() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const result = await axios.get(`${apiUrl}/room/getoneroom/${roomid}`);
      setroomdata(result?.data?.response);
    } catch (err) {
      console.log(err);      
    }
  }

  async function allbookings() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const result = await axios.get(`${apiUrl}/booking/roombooking/${roomid}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
      setbookingdata(result?.data?.result || []);
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.log(err);      
    }
  }

  

  async function allcoupans() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const result = await axios.get(`${apiUrl}/coupan/getallcoupans/${roomid}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
      const fetchedCoupons = result?.data?.response || result?.data?.result || [];
      setcoupandata(fetchedCoupons);
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.log(err);      
    }
  }

  useEffect(() => {
    if (roomid) {
      fetchroom();
      allbookings();
      allcoupans();
    }
  }, [roomid]);

  const getValidCoupons = () => {
    const today = moment().startOf('day');
    const roomPrice = Number(roomdata?.price || 0);

    return coupandata.filter((coupon) => {
      if (!coupon.activestatus) return false;
      const endDate = moment(coupon.enddate).endOf('day');
      const isNotExpired = endDate.isSameOrAfter(today);
      const isPriceEligible = Number(coupon.maxprice) <= roomPrice;
      
      return isNotExpired && isPriceEligible;
    });
  
    
  };

  const validCoupons = getValidCoupons();

  useEffect(() => {
    if (validCoupons.length > 0 && !appliedCoupon) {
      setAppliedCoupon(validCoupons[0]);
    }
  }, [coupandata, roomdata]);

  const facilityItems = [
    { key: 'wifi', label: 'High-speed Wi-Fi', icon: Wifi },
    { key: 'ac', label: 'Air Conditioning', icon: Wind },
    { key: 'tv', label: 'Smart TV', icon: Tv },
    { key: 'breakfastincluded', label: 'Free Breakfast', icon: Coffee },
    { key: 'parking', label: 'Free Parking', icon: Car },
    { key: 'minibar', label: 'Minibar', icon: Sparkles },
    { key: 'roomservice', label: '24/7 Room Service', icon: Building },
    { key: 'balcony', label: 'Private Balcony', icon: MapPin },
  ];

  const getBookingStatusForDate = (date) => {
    const target = moment(date).startOf('day');

    for (const booking of bookingdata) {
      if (booking.bookingstatus === 'cancelled') continue;

      const checkIn = moment(booking.checkIn).startOf('day');
      const checkOut = moment(booking.checkOut).startOf('day');

      const start = checkIn.isBefore(checkOut) ? checkIn : checkOut;
      const end = checkIn.isBefore(checkOut) ? checkOut : checkIn;

      if (target.isBetween(start, end, 'day', '[]')) {
        return booking.bookingstatus;
      }
    }

    return null;
  };

  const isRangeBlocked = (checkInStr, checkOutStr) => {
    if (!checkInStr || !checkOutStr) return false;

    const start = moment(checkInStr).startOf('day');
    const end = moment(checkOutStr).startOf('day');

    if (end.isBefore(start)) return true;

    for (const booking of bookingdata) {
      if (booking.bookingstatus === 'cancelled') continue;

      const bStart = moment(booking.checkIn).startOf('day');
      const bEnd = moment(booking.checkOut).startOf('day');

      if (start.isSameOrBefore(bEnd) && end.isSameOrAfter(bStart)) {
        return true;
      }
    }

    return false;
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const status = getBookingStatusForDate(date);
      if (status === 'pending') return 'pending-date';
      if (status === 'active') return 'active-date';
      return 'available-date';
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...bookingForm, [name]: value };
    setBookingForm(updatedForm);

    if (name === 'checkIn' || name === 'checkOut') {
      const { checkIn, checkOut } = updatedForm;
      if (checkIn && checkOut) {
        if (moment(checkOut).isSameOrBefore(moment(checkIn))) {
          setDateError('Check-out date must be after Check-in date.');
        } else if (isRangeBlocked(checkIn, checkOut)) {
          setDateError('Selected dates overlap with booked or pending dates. Please choose different dates.');
        } else {
          setDateError('');
        }
      } else {
        setDateError('');
      }
    }
  };

  const calculateNights = () => {
    if (!bookingForm.checkIn || !bookingForm.checkOut || dateError) return 0;
    const start = moment(bookingForm.checkIn);
    const end = moment(bookingForm.checkOut);
    const diff = end.diff(start, 'days');
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const rawTotal = nights * Number(roomdata?.price || 0);
  const discountAmount = appliedCoupon ? (rawTotal * Number(appliedCoupon.discount)) / 100 : 0;
  const finalTotal = rawTotal - discountAmount;

  async function handlebooking(e) {
    e.preventDefault();

    try {
      const data = {
        ...bookingForm,
        totalPrice: finalTotal,
        userId,
        roomId: roomid,
      };

      const apiUrl = import.meta.env.VITE_API_URL;
      const result = await axios.post(`${apiUrl}/booking/bookinghotel`, { ...data },{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });

      if (result.status === 201) {
        setIsModalOpen(false);

        setBookingForm({
          checkIn: '',
          checkOut: '',
          guests: 1,
        });

        setAppliedCoupon(null);
        setDateError('');

        allbookings();
      }
    } catch (err) {
       if(err.status===401){
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
    }
      console.log(err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* HEADER SECTION */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span>{roomdata?.hotel_id?.hotelName || 'Hotel Name'}</span>
            <span>•</span>
            <span>Room {roomdata?.roomno}</span>
          </div>
          <h1 className="text-3xl font-extrabold capitalize text-slate-900 dark:text-white">
            {roomdata?.roomtype} Suite
          </h1>
          <p className="mt-1 flex items-center text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="mr-1 h-4 w-4 text-rose-500" />
            {roomdata?.hotel_id?.Address || 'Address unavailable'}
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* LEFT COLUMN: Room & Hotel Details */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Gallery */}
            <div className="grid grid-cols-1 gap-4 overflow-hidden rounded-2xl shadow-sm sm:grid-cols-2">
              <img 
                src={roomdata?.image1 || roomdata?.hotel_id?.images} 
                alt="Room View 1" 
                className="h-72 w-full rounded-xl object-cover transition hover:opacity-95"
              />
              {roomdata?.image2 && (
                <img 
                  src={roomdata?.image2} 
                  alt="Room View 2" 
                  className="h-72 w-full rounded-xl object-cover transition hover:opacity-95"
                />
              )}
            </div>

            {/* Room Features */}
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
              <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                Room Features
              </h2>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium">
                    Max Guests: {roomdata?.facilities?.maxguests || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                  <BedDouble className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium capitalize">
                    {roomdata?.facilities?.bedtype || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Dynamic Facilities List */}
              <h3 className="pt-2 text-md font-semibold text-slate-900 dark:text-white">
                Amenities & Services
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {facilityItems.map((item) => (
                  <div 
                    key={item.key} 
                    className={`flex items-center space-x-2 rounded-xl border p-2.5 text-sm transition-colors ${
                      roomdata?.facilities?.[item.key] 
                        ? 'border-indigo-100 bg-indigo-50/50 text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-300' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 line-through dark:border-slate-800/60 dark:bg-slate-800/30 dark:text-slate-600'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${
                      roomdata?.facilities?.[item.key] 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-400 dark:text-slate-600'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Description Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                About the Hotel
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {roomdata?.hotel_id?.description || 'No description available.'}
              </p>
              
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>{roomdata?.hotel_id?.hotelEmail || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>{roomdata?.hotel_id?.hotelPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: React Calendar & Book Now Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-colors dark:border-slate-800 dark:bg-slate-900">
              
              {/* Pricing & Availability Header */}
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ₹{roomdata?.price}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400"> / night</span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  roomdata?.isavailable 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400'
                }`}>
                  {roomdata?.isavailable ? 'Available' : 'Booked'}
                </span>
              </div>

              {/* REACT CALENDAR DISPLAY */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CalendarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Room Schedule
                </h3>

                <div className="custom-calendar-container">
                  <Calendar
                    onChange={setSelectedCalendarDate}
                    value={selectedCalendarDate}
                    tileClassName={getTileClassName}
                    tileDisabled={({ date }) => !!getBookingStatusForDate(date)}
                    prev2Label={null}
                    next2Label={null}
                  />
                </div>

                {/* Status Legend */}
                <div className="flex items-center justify-around border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                    <span>Active</span>
                  </div>
                </div>
              </div>

              {/* RESERVE BUTTON -> OPENS POPUP */}
              <button 
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={!roomdata?.isavailable}
                className="w-full cursor-pointer rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold tracking-wide text-white shadow-lg transition duration-200 hover:bg-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              >
                {roomdata?.isavailable ? 'Reserve Room' : 'Currently Unavailable'}
              </button>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                You won't be charged yet
              </p>

            </div>
          </div>

        </div>
      </div>

      {/* BOOKING MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Reserve Room {roomdata?.roomno}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {roomdata?.hotel_id?.hotelName}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlebooking} className="mt-4 space-y-4">
              
              {/* Check-in & Check-out Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    min={moment().format('YYYY-MM-DD')}
                    value={bookingForm.checkIn}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    min={bookingForm.checkIn || moment().format('YYYY-MM-DD')}
                    value={bookingForm.checkOut}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {dateError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{dateError}</span>
                </div>
              )}

              {/* Guests Input */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Guests
                </label>
                <input
                  type="number"
                  name="guests"
                  min="1"
                  max={roomdata?.facilities?.maxguests || 10}
                  value={bookingForm.guests}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500"
                />
              </div>

              {/* Available Coupons */}
              <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Available Coupons
                </label>

                {validCoupons.length > 0 ? (
                  <div className="space-y-2">
                    {validCoupons.map((coupon) => {
                      const isApplied = appliedCoupon?._id === coupon._id;
                      return (
                        <div
                          key={coupon._id}
                          className={`flex items-center justify-between rounded-xl border p-3 text-xs transition ${
                            isApplied
                              ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/50'
                              : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                          }`}
                        >
                          <div>
                            <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">
                              {coupon.coupancode}
                            </span>
                            <span className="ml-2 text-slate-600 dark:text-slate-400">
                              ({coupon.discount}% Off)
                            </span>
                            <div className="mt-0.5 text-[10px] text-slate-400">
                              Valid till {moment(coupon.enddate).format('DD MMM YYYY')}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAppliedCoupon(isApplied ? null : coupon)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                              isApplied
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {isApplied ? 'Applied ✓' : 'Apply'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">No eligible coupons available for this room.</p>
                )}
              </div>

              {/* Price Calculation Summary */}
              {nights > 0 && !dateError && (
                <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>₹{roomdata?.price} x {nights} night(s)</span>
                    <span>₹{rawTotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                      <span>Discount ({appliedCoupon.coupancode} - {appliedCoupon.discount}%)</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                    <span>Total Amount</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
              )}

              {/* Submit / Confirm Booking Button */}
              <button
                type="submit"
                disabled={!bookingForm.checkIn || !bookingForm.checkOut || !!dateError || nights <= 0}
                className="w-full cursor-pointer rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg transition duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              >
                Confirm Booking
              </button>
            </form>

          </div>
        </div>
      )}

      {/* CUSTOM CALENDAR STYLES */}
      <style>{`
  .custom-calendar-container .react-calendar {
    width: 100%;
    background: transparent;
    border: none;
    font-family: inherit;
  }

  .custom-calendar-container .react-calendar__navigation button {
    color: inherit;
    font-weight: 600;
    border-radius: 0.5rem;
  }

  .custom-calendar-container .react-calendar__navigation button:enabled:hover {
    background-color: rgba(148, 163, 184, 0.15);
  }

  /* Weekdays row alignment */
  .custom-calendar-container .react-calendar__month-view__weekdays {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px !important;
    text-align: center;
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .custom-calendar-container .react-calendar__month-view__weekdays__weekday {
    padding: 0 !important;
  }

  /* GRID GAP BETWEEN DATES */
  .custom-calendar-container .react-calendar__month-view__days {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px !important;
  }

  /* Tile formatting for grid layout */
  .custom-calendar-container .react-calendar__tile {
    width: 100% !important;
    max-width: 100% !important;
    aspect-ratio: 1 / 1;
    display: flex !important;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem !important;
    padding: 0 !important;
    font-size: 0.85rem;
  }

  /* Pending Dates Style (Yellow) */
  .custom-calendar-container .pending-date {
    background-color: #fef3c7 !important;
    color: #d97706 !important;
  }
  .dark .custom-calendar-container .pending-date {
    background-color: rgba(180, 83, 9, 0.3) !important;
    color: #fbbf24 !important;
  }

  /* Active Dates Style (Red) */
  .custom-calendar-container .active-date {
    background-color: #ffe4e6 !important;
    color: #e11d48 !important;
    text-decoration: line-through;
  }
  .dark .custom-calendar-container .active-date {
    background-color: rgba(159, 18, 57, 0.4) !important;
    color: #fb7185 !important;
  }

  /* Available Dates Style (Green) */
  .custom-calendar-container .available-date {
    background-color: #ecfdf5 !important;
    color: #047857 !important;
  }
  .dark .custom-calendar-container .available-date {
    background-color: rgba(6, 78, 59, 0.3) !important;
    color: #34d399 !important;
  }
`}</style>
    </div>
  );
}

export default UserRoombook;