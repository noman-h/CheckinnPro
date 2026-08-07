import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();

  const [hoteldata, sethoteldata] = useState([]);
  const [citydata, setcitydata] = useState([]);

  const [search, setsearch] = useState('');
  const [stateselect, setstateselect] = useState('');
  const [districtselect, setdistrictselect] = useState('');
  const [cityselect, setcityselect] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000);

  async function fetchhotels() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/hotel/getallhotels`
      );
      sethoteldata(result?.data?.response || []);
    } catch (err) {
      console.error(err.response || err);
    }
  }

  async function fetchcity() {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/location/getallcity`
      );
      setcitydata(result?.data?.response || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchcity();
    fetchhotels();
  }, []);

  const handleStateChange = (e) => {
    setstateselect(e.target.value);
    setdistrictselect('');
    setcityselect('');
  };

  const handleDistrictChange = (e) => {
    setdistrictselect(e.target.value);
    setcityselect('');
  };

  const resetFilters = () => {
    setsearch('');
    setstateselect('');
    setdistrictselect('');
    setcityselect('');
    setMaxPrice(10000);
  };

  // Dropdown options
  const stateOptions = useMemo(() => {
    return citydata.map((s) => (
      <option key={s._id || s.statename} value={s.statename}>
        {s.statename}
      </option>
    ));
  }, [citydata]);

  const districtOptions = useMemo(() => {
    const currentState = citydata.find((s) => s.statename === stateselect);
    if (!currentState) return [];
    return (currentState.alldistricts || []).map((d) => (
      <option key={d._id || d.districtname} value={d._id}>
        {d.districtname}
      </option>
    ));
  }, [citydata, stateselect]);

  const cityOptions = useMemo(() => {
    const currentState = citydata.find((s) => s.statename === stateselect);
    if (!currentState) return [];
    const currentDistrict = (currentState.alldistricts || []).find(
      (d) => d._id === districtselect || d.districtname === districtselect
    );
    if (!currentDistrict) return [];
    return (currentDistrict.allcities || []).map((c) => (
      <option key={c._id || c.cityname} value={c._id || c.cityname}>
        {c.cityname}
      </option>
    ));
  }, [citydata, stateselect, districtselect]);

  // Helper function to get starting price
  const getStartingPrice = (hotel) => {
    if (Array.isArray(hotel.roomarray) && hotel.roomarray.length > 0) {
      const roomPrices = hotel.roomarray
        .map((r) => r.price)
        .filter((p) => typeof p === 'number');
      if (roomPrices.length > 0) return Math.min(...roomPrices);
    }
    return hotel.pricePerNight || hotel.price || 0;
  };

  // Main Filter Logic matching exact JSON keys
  const filteredhotel = useMemo(() => {
    return hoteldata.filter((hotel) => {
      // 1. Active Status Check
      if (hotel.activeStatus !== undefined && hotel.activeStatus !== true) return false;

      // 2. Search Term Filter (Matches name, email, or city name)
      const searchTerm = search.trim().toLowerCase();
      if (searchTerm) {
        const cityName = typeof hotel.CityId === 'object' ? hotel.CityId?.cityname : '';
        const matchesSearch = [hotel.hotelName, hotel.hotelEmail, cityName].some((val) =>
          val?.toLowerCase().includes(searchTerm)
        );
        if (!matchesSearch) return false;
      }

      // 3. Price Filter
      const startingPrice = getStartingPrice(hotel);
      if (startingPrice > maxPrice) return false;

      // 4. District ID Matching (Targeting exact key: hotel.CityId.district_id)
      if (districtselect) {
        const hotelDistrictId =
          typeof hotel.CityId === 'object'
            ? typeof hotel.CityId?.district_id === 'object'
              ? hotel.CityId?.district_id?._id
              : hotel.CityId?.district_id
            : null;

        if (hotelDistrictId?.toString() !== districtselect.toString()) {
          return false;
        }
      }

      // 5. City Filter (Supports ID or cityname match)
      if (cityselect) {
        const hotelCityId = typeof hotel.CityId === 'object' ? hotel.CityId?._id : null;
        const hotelCityName = typeof hotel.CityId === 'object' ? hotel.CityId?.cityname : '';

        const isIdMatch = hotelCityId && hotelCityId.toString() === cityselect.toString();
        const isNameMatch = hotelCityName.toLowerCase() === cityselect.toLowerCase();

        if (!isIdMatch && !isNameMatch) return false;
      }

      return true;
    });
  }, [hoteldata, search, maxPrice, districtselect, cityselect]);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      
      {/* HEADER / HERO SECTION */}
      <header className="relative border-b border-slate-200/80 bg-linear-to-b from-white via-slate-50 to-slate-100/80 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 py-12 md:py-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-6">
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                Find Your Perfect Stay
              </h1>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
                Search through luxury hotels, suites, and budget stays
              </p>
            </div>

            <div className="relative w-full max-w-2xl shadow-lg rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search hotel name, city, or email..."
                value={search}
                onChange={(e) => setsearch(e.target.value)}
                className="w-full pl-12 pr-12 py-4 text-base rounded-2xl border border-slate-200/80 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition dark:border-slate-700/80 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              {search && (
                <button
                  onClick={() => setsearch('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR FILTERS */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-6 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Filter Stays
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition"
                >
                  Reset All
                </button>
              </div>

              <div className="mt-5 space-y-6">
                
                {/* Location Selectors */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Location
                  </label>
                  
                  <select
                    value={stateselect}
                    onChange={handleStateChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                  >
                    <option value="">Select State</option>
                    {stateOptions}
                  </select>

                  <select
                    value={districtselect}
                    onChange={handleDistrictChange}
                    disabled={!stateselect}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none disabled:opacity-40 transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                  >
                    <option value="">Select District</option>
                    {districtOptions}
                  </select>

                  <select
                    value={cityselect}
                    onChange={(e) => setcityselect(e.target.value)}
                    disabled={!districtselect}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none disabled:opacity-40 transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                  >
                    <option value="">Select City</option>
                    {cityOptions}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                      Max Price / Night
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ₹{maxPrice}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:bg-slate-700"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹500</span>
                    <span>₹10,000+</span>
                  </div>
                </div>

              </div>
            </div>
          </aside>

          {/* HOTEL LISTINGS FEED */}
          <main className="flex-1 min-w-0">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Showing <span className="font-bold text-slate-900 dark:text-white">{filteredhotel.length}</span> Results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredhotel.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-sm font-medium text-slate-400">
                    No properties match your exact criteria. Try resetting filters.
                  </p>
                </div>
              ) : (
                filteredhotel.map((hotel) => {
                  const startingPrice = getStartingPrice(hotel);

                  return (
                    <div
                      key={hotel._id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                    >
                      {/* Top Image & Badge */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={hotel.images}
                          alt={hotel.hotelName}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {hotel.approveStatus && (
                          <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-emerald-600 dark:bg-slate-900/90 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                            {hotel.approveStatus}
                          </span>
                        )}
                      </div>

                      {/* Details Section */}
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize line-clamp-1">
                            {hotel.hotelName}
                          </h3>

                          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {hotel.description}
                          </p>
                        </div>

                        {/* Price & Action Button */}
                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Starts at
                            </p>
                            <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base leading-none mt-0.5">
                              ₹{startingPrice} <span className="text-[10px] font-normal text-slate-400">/night</span>
                            </p>
                          </div>

                          <button
                            onClick={() => navigate(`hotelbook/${hotel?.hotelEmail}`)}
                            className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

export default UserDashboard;