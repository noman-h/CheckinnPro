import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UseDebouncing from '../Hooks/UseDebouncing';
import { Search, MapPin, Sparkles, RotateCcw, Building, ChevronRight, SlidersHorizontal, IndianRupee, X, Filter } from 'lucide-react';

function UserDashboard() {
  const navigate = useNavigate();

  const [hoteldata, sethoteldata] = useState([]);
  const [citydata, setcitydata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters & Search State
  const [search, setsearch] = useState('');
  const [sort, setsort] = useState('');
  const [stateselect, setstateselect] = useState('');
  const [districtselect, setdistrictselect] = useState('');
  const [cityselect, setcityselect] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000);

  const debouncedSearch = UseDebouncing(search, 800);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);

  async function fetchhotels() {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * limit;
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/hotel/getallhotels?search=${debouncedSearch}&sort=${sort}&status=active&skip=${skip}&limit=${limit}`
      );
      const responseData = result?.data?.response || [];
      sethoteldata(responseData);

      const count = result?.data?.totalcount ?? responseData.length;
      setTotalHotels(count);
      setTotalPages(Math.ceil(count / limit) || 1);
    } catch (err) {
      console.error('Error fetching hotels:', err.response || err);
    } finally {
      setLoading(false);
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
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sort, districtselect, cityselect, maxPrice]);

  useEffect(() => {
    fetchhotels();
  }, [debouncedSearch, sort, currentPage, limit]);

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
    setsort('');
    setstateselect('');
    setdistrictselect('');
    setcityselect('');
    setMaxPrice(10000);
    setCurrentPage(1);
  };

  // Dropdown options
  const stateOptions = useMemo(() => {
    return citydata.map((s) => (
      <option key={s?.district_id?.
state_id} value={s?.district_id?.
state_id?.statename}>
        {s?.district_id?.
state_id?.statename}
      </option>
    ));
  }, [citydata]);

  const districtOptions = useMemo(() => {
    const currentState = citydata.find((s) => s?.district_id?.
state_id?.statename === stateselect);
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

  // Client-side filtering for location & max price over fetched page
  const filteredhotel = useMemo(() => {
    return hoteldata.filter((hotel) => {
      // 1. Price Filter
      const startingPrice = getStartingPrice(hotel);
      if (startingPrice > maxPrice) return false;

      // 2. District ID Matching
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

      // 3. City Filter
      if (cityselect) {
        const hotelCityId = typeof hotel.CityId === 'object' ? hotel.CityId?._id : null;
        const hotelCityName = typeof hotel.CityId === 'object' ? hotel.CityId?.cityname : '';

        const isIdMatch = hotelCityId && hotelCityId.toString() === cityselect.toString();
        const isNameMatch = hotelCityName.toLowerCase() === cityselect.toLowerCase();

        if (!isIdMatch && !isNameMatch) return false;
      }

      return true;
    });
  }, [hoteldata, maxPrice, districtselect, cityselect]);

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

  const startItem = totalHotels === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalHotels);

  const FilterContent = () => (
    <div className="space-y-5">
      {/* SORT BY */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => setsort(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Default Order</option>
          <option value="az">Name: A → Z</option>
          <option value="za">Name: Z → A</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* LOCATION SELECTORS */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Location
        </label>
        
        <select
          value={stateselect}
          onChange={handleStateChange}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Select State</option>
          {stateOptions}
        </select>

        <select
          value={districtselect}
          onChange={handleDistrictChange}
          disabled={!stateselect}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Select District</option>
          {districtOptions}
        </select>

        <select
          value={cityselect}
          onChange={(e) => setcityselect(e.target.value)}
          disabled={!districtselect}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Select City</option>
          {cityOptions}
        </select>
      </div>

      {/* PRICE FILTER */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-400">
            Max Price / Night
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
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
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-700"
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>₹500</span>
          <span>₹10,000+</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      
      {/* HERO BANNER SECTION */}
      <header className="relative border-b border-slate-200/80 bg-linear-to-b from-indigo-900/10 via-slate-50 to-slate-100/80 py-8 shadow-xs dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 sm:py-12 md:py-16">
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-4 text-center sm:space-y-5">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-sm dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Sparkles size={14} />
              <span>Book Premier Hotels & Suites</span>
            </div>

            <h1 className="bg-linear-to-r from-emerald-600 via-teal-500 to-indigo-600 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              Discover & Reserve Perfect Stays
            </h1>
            <p className="max-w-xl text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm md:text-base">
              Explore luxury resorts, executive suites, and budget stays at best guaranteed prices.
            </p>

            {/* SEARCH INPUT BAR */}
            <div className="relative w-full max-w-2xl shadow-lg shadow-slate-200/50 dark:shadow-none">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-500 sm:pl-4">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                placeholder="Search by hotel name, location, or city..."
                value={search}
                onChange={(e) => setsearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-10 pl-10 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 sm:py-4 sm:pr-12 sm:pl-12 sm:text-sm"
              />
              {search && (
                <button
                  onClick={() => setsearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 sm:pr-4"
                >
                  ✕
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <div className="w-full px-4 py-6 sm:px-6 md:px-8 xl:px-12 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Filters & Sort
                  </span>
                </div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              <div className="mt-5">
                <FilterContent />
              </div>
            </div>
          </aside>

          {/* MOBILE FILTER TOGGLE & OVERLAY DRAWER */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Filters & Sort</span>
            </button>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {filteredhotel.length} Stays
            </span>
          </div>

          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center p-0 sm:p-4 lg:hidden">
              <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[85vh] overflow-y-auto">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Filters & Sort Options
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <FilterContent />

                <div className="mt-6 flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => { resetFilters(); setIsMobileFilterOpen(false); }}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HOTEL LISTINGS FEED */}
          <main className="min-w-0 flex-1">
            
            <div className="mb-4 hidden items-center justify-between lg:flex">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Showing <strong className="text-slate-900 dark:text-white">{filteredhotel.length}</strong> Stays
                {totalHotels > 0 && <span className="ml-1 text-slate-400">(Total {totalHotels})</span>}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
                <p className="text-xs font-medium">Finding available properties...</p>
              </div>
            ) : filteredhotel.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
                <Building className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No properties found matching your search and filter options.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-3 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                {filteredhotel.map((hotel) => {
                  const startingPrice = getStartingPrice(hotel);

                  return (
                    <div
                      key={hotel._id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      {/* HOTEL IMAGE & BADGE */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-48">
                        <img
                          src={hotel.images}
                          alt={hotel.hotelName}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {hotel.CityId?.cityname && (
                          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-md border border-slate-200/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-xs backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 sm:px-2.5 sm:py-1">
                            <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            {hotel.CityId.cityname}
                          </span>
                        )}
                        {hotel.approveStatus === "approved" && (
                          <span className="absolute top-3 right-3 rounded-md border border-emerald-200 bg-emerald-50/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-xs backdrop-blur-md dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 sm:px-2.5 sm:py-1">
                            Verified
                          </span>
                        )}
                      </div>

                      {/* DETAILS SECTION */}
                      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          <h3 className="line-clamp-1 text-sm font-bold capitalize text-slate-900 dark:text-white sm:text-base">
                            {hotel.hotelName}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 sm:mt-1.5">
                            {hotel.description}
                          </p>
                        </div>

                        {/* PRICE & BOOK BUTTON */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 sm:mt-5">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Starts at
                            </p>
                            <p className="mt-0.5 text-sm font-extrabold text-emerald-600 dark:text-emerald-400 sm:text-base">
                              ₹{startingPrice} <span className="text-[10px] font-normal text-slate-400">/night</span>
                            </p>
                          </div>

                          <button
                            onClick={() => navigate(`/hotelbook/${hotel?.hotelEmail}`)}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:px-3.5"
                          >
                            <span>Book Now</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* --- PAGINATION CONTROLS --- */}
            {totalHotels > 0 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                  <span>
                    Showing <strong className="text-slate-900 dark:text-white">{startItem}</strong> to{" "}
                    <strong className="text-slate-900 dark:text-white">{endItem}</strong> of{" "}
                    <strong className="text-slate-900 dark:text-white">{totalHotels}</strong> properties
                  </span>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs">Show:</label>
                    <select
                      value={limit}
                      onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                    >
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={16}>16</option>
                      <option value={24}>24</option>
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
                              ? "bg-emerald-600 text-white shadow-xs"
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

export default UserDashboard;