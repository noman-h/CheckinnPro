import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function UserHotelbook() {
  const navigate = useNavigate();
  const { hotelEmail } = useParams();

  
  
  const userId = localStorage.getItem("userid");
  const [roomdata, setroomdata] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchhotels() {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const result = await axios.get(
        `${apiUrl}/room/getallhotelrooms/${hotelEmail}?search&&status=active`
      );
      setroomdata(result?.data?.response || []);
    } catch (err) {
      alert(err?.message || "Failed to fetch rooms");
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
  
  

  useEffect(() => {
    fetchhotels();
    window.scrollTo(0, 0);
  }, [hotelEmail]);

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

  const filteredRooms = roomdata.filter((room) => {
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto min-w-7xl">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white">
                Filters
              </h2>

              {/* Price */}
              <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">
                Price
              </h3>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mb-5 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">All</option>
                <option value="0-1000">₹0 - ₹1000</option>
                <option value="1000-2000">₹1000 - ₹2000</option>
                <option value="2000+">₹2000+</option>
              </select>

              {/* Room Type */}
              <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">
                Room Type
              </h3>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="mb-5 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">All</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="deluxe">Deluxe</option>
              </select>

              {/* Facilities */}
              <h3 className="mb-3 font-semibold text-slate-700 dark:text-slate-300">
                Facilities
              </h3>
              <div className="space-y-2">
                {Object.keys(filters).map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-2 text-sm capitalize text-slate-700 dark:text-slate-300"
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
                    />
                    {item.replace(/([A-Z])/g, " $1")}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Rooms List */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="py-20 text-center text-slate-500">
                Loading rooms...
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredRooms.map((room) => (
                    <div
                      key={room._id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                    >
                      <img
                        src={room.image1}
                        alt={`Room ${room.roomno}`}
                        className="h-56 w-full object-cover"
                      />

                      <div className="space-y-4 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                              Room {room.roomno}
                            </h2>
                            <p className="capitalize text-slate-500">
                              {room.roomtype}
                            </p>
                          </div>

                          <div className="rounded-full bg-indigo-100 px-4 py-2 font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            ₹{room.price}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {Object.entries(room.facilities || {})
                            .filter(([_, value]) => value === true)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {key.replace(/([A-Z])/g, " $1")}
                              </span>
                            ))}
                        </div>

                        <button
                          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
                          onClick={() => handleviewbook(room._id)}
                        >
                          View & Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRooms.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center text-slate-500 dark:border-slate-700">
                    No rooms found matching your active filters.
                  </div>
                )}
              </>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

export default UserHotelbook;