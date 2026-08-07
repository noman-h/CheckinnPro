import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, SlidersHorizontal, CheckCircle2, BedDouble, UserCheck, ShieldCheck, ChevronRight } from 'lucide-react';
import UseDebouncing from '../Hooks/UseDebouncing';

function UserHotelbook() {
  const navigate = useNavigate();
  const { hotelEmail } = useParams();
  const userId = localStorage.getItem("userid");

  const [roomdata, setroomdata] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Sort State
  const [search, setsearch] = useState('');
  const [sort, setsort] = useState('');
  const debouncedSearch = UseDebouncing(search, 800);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);

  // Client side filters
  const [price, setPrice] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [filters, setFilters] = useState({
    wifi: false,
    ac: false,
    tv: false,
    minibar: false,
    breakfastincluded: false,
    parking: false,
    roomservice: false,
    laundry: false,
    balcony: false,
    smokingAllowed: false,
  });

  async function fetchrooms() {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const skip = (currentPage - 1) * limit;
      const result = await axios.get(
        `${apiUrl}/room/getallhotelrooms/${hotelEmail}?search=${debouncedSearch}&status=active&sort=${sort}&skip=${skip}&limit=${limit}`
      );
      const responseData = result?.data?.response || [];
      setroomdata(responseData);

      const count = result?.data?.totalcount ?? responseData.length;
      setTotalRooms(count);
      setTotalPages(Math.ceil(count / limit) || 1);
    } catch (err) {
      console.error(err?.message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  }

  async function handleviewbook(roomId) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const result = await axios.post(`${apiUrl}/tempbook/tempbookings`, { roomId, userId });
      if (result.status === 200 || result.status === 201) {
        navigate(`/roombook/${roomId}`);
      }
    } catch (err) {
      console.log(err.response);
    }
  }

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sort, price, roomType, filters]);

  useEffect(() => {
    fetchrooms();
    window.scrollTo(0, 0);
  }, [hotelEmail, debouncedSearch, sort, currentPage, limit]);

  const filteredRooms = useMemo(() => {
    return roomdata.filter((room) => {
      // Price Filter
      if (price === "0-1000" && room.price > 1000) return false;
      if (price === "1000-2000" && (room.price < 1000 || room.price > 2000)) return false;
      if (price === "2000+" && room.price < 2000) return false;

      // Room Type Filter
      if (roomType !== "all" && room.roomtype !== roomType) return false;

      // Facilities Filter
      for (const key in filters) {
        if (filters[key] && !room.facilities?.[key]) {
          return false;
        }
      }

      return true;
    });
  }, [roomdata, price, roomType, filters]);

  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const startItem = totalRooms === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalRooms);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <div className="w-full px-2 sm:px-4 md:px-6 xl:px-8">
        
        {/* TOP NAVIGATION & HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hotels
          </button>

          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search room no or type..."
                value={search}
                onChange={(e) => setsearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setsort(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">Sort Price</option>
              <option value="az">Low to High</option>
              <option value="za">High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* SIDEBAR FILTERS */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                    Filter Rooms
                  </h2>
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Price Range
                </label>
                <select
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">All Prices</option>
                  <option value="0-1000">Under ₹1,000</option>
                  <option value="1000-2000">₹1,000 - ₹2,000</option>
                  <option value="2000+">₹2,000+</option>
                </select>
              </div>

              {/* Room Type */}
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>

              {/* Facilities */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Included Amenities
                </label>
                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                  {Object.keys(filters).map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-2 text-xs font-medium capitalize text-slate-700 dark:text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={filters[item]}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            [item]: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{item.replace(/([A-Z])/g, " $1")}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ROOMS LIST FEED */}
          <main className="lg:col-span-3">
            
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Available Rooms: <strong className="text-slate-900 dark:text-white">{filteredRooms.length}</strong>
                {totalRooms > 0 && <span className="ml-1 text-slate-400">(Total {totalRooms})</span>}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                <p className="text-xs font-medium">Fetching hotel rooms...</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 py-20 text-center dark:border-slate-800 dark:bg-slate-900/60">
                <BedDouble className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No rooms found matching your current filter choices.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredRooms.map((room) => (
                  <div
                    key={room._id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={room.image1}
                        alt={`Room ${room.roomno}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 rounded-md border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-xs backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 dark:text-white">
                        Room {room.roomno}
                      </span>
                      <span className={`absolute top-3 right-3 rounded-md px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md shadow-xs ${
                        room.isavailable 
                          ? "border border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300"
                          : "border border-rose-200 bg-rose-50/90 text-rose-700 dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-300"
                      }`}>
                        {room.isavailable ? "Available" : "Booked"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold capitalize text-slate-900 dark:text-white">
                            {room.roomtype} Room
                          </h3>
                          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            ₹{room.price} <span className="text-[10px] font-normal text-slate-400">/night</span>
                          </span>
                        </div>

                        {/* Facilities Pills */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {Object.entries(room.facilities || {})
                            .filter(([_, value]) => value === true)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {key.replace(/([A-Z])/g, " $1")}
                              </span>
                            ))}
                        </div>
                      </div>

                      <button
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
                        disabled={!room.isavailable}
                        onClick={() => handleviewbook(room._id)}
                      >
                        <span>{room.isavailable ? "View & Reserve Room" : "Currently Unavailable"}</span>
                        {room.isavailable && <ChevronRight className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- PAGINATION CONTROLS --- */}
            {totalRooms > 0 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    Showing <strong className="text-slate-900 dark:text-white">{startItem}</strong> to{" "}
                    <strong className="text-slate-900 dark:text-white">{endItem}</strong> of{" "}
                    <strong className="text-slate-900 dark:text-white">{totalRooms}</strong> rooms
                  </span>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs">Show:</label>
                    <select
                      value={limit}
                      onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value={4}>4</option>
                      <option value={6}>6</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers.map((p, idx) =>
                      p === '...' ? (
                        <span key={`d${idx}`} className="px-1.5 text-xs text-slate-400">...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                            currentPage === p
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>
      </div>
    </div>
  );
}

export default UserHotelbook;