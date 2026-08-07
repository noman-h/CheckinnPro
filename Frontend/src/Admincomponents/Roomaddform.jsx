import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Roomaddform() {

  const navigate = useNavigate();

  const role=localStorage.getItem("user")
  const hotelemail=localStorage.getItem("email")

  const [hoteldata, sethoteldata] = useState([]);

    
      async function fetchhotels() {
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/hotel/getallhotels`,
          );
    
          sethoteldata(result?.data?.response || []);
        } catch (err) {
          console.log(err);
        }
      }




useEffect(()=>{
    fetchhotels()
},[])

  const [formData, setFormData] = useState({
    hotel_id: '',
    roomno: '',
    roomtype: 'single',
    price: '',
    isavailable: true,
    facilities: {
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
      maxguests: 2,
      bedtype: 'doublebed',
    },
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.hotel_id?.trim()) {
      newErrors.hotel_id = 'Please select a Hotel.';
    }

    if (!formData.roomno?.trim()) {
      newErrors.roomno = 'Room number is required.';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required.';
    } else if (Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0.';
    }

    if (!formData.facilities.maxguests) {
      newErrors.maxguests = 'Max guests is required.';
    } else if (Number(formData.facilities.maxguests) < 1) {
      newErrors.maxguests = 'Max guests must be at least 1.';
    }

    const imageKeys = ['image1', 'image2', 'image3', 'image4', 'image5'];
    const hasAtLeastOneImage = imageKeys.some((key) => formData[key] !== null);

    if (!hasAtLeastOneImage) {
      newErrors.images = 'Please upload at least one room image (Image 1).';
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    imageKeys.forEach((key) => {
      const file = formData[key];
      if (file) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          newErrors[key] = 'Only JPG, PNG, and WEBP formats are allowed.';
        } else if (file.size > MAX_FILE_SIZE) {
          newErrors[key] = 'File size must be less than 5MB.';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const selectedFile = files[0] || null;

    setFormData((prev) => ({
      ...prev,
      [name]: selectedFile,
    }));

    if (errors[name] || errors.images) {
      setErrors((prev) => ({ ...prev, [name]: null, images: null }));
    }
  };

  const handleFacilityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     if(role==="hotel"){
      const hotel=hoteldata.find((i)=> i.hotelEmail===hotelemail)
      setFormData({...formData,hotel_id:hotel._id})
    } 

    if (!validateForm()) {
      return;
    }

    const payload = new FormData();
    payload.append('hotel_id', formData.hotel_id);
    payload.append('roomno', formData.roomno);
    payload.append('roomtype', formData.roomtype);
    payload.append('price', formData.price);
    payload.append('isavailable', formData.isavailable);
    payload.append('facilities', JSON.stringify(formData.facilities));

    ['image1', 'image2', 'image3', 'image4', 'image5'].forEach((key) => {
      if (formData[key]) {
        payload.append(key, formData[key]);
      }
    });
   
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/room/addroom`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        alert('Room added successfully!');
        setFormData({
    hotel_id: '',
    roomno: '',
    roomtype: 'single',
    price: '',
    isavailable: true,
    facilities: {
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
      maxguests: 2,
      bedtype: 'doublebed',
    },
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
  })
      }
    } catch (err) {
      console.error('Submission failed:', err.response);
      const errorMessage = err.response?.data?.message || 'Failed to submit room details.';
      alert(`Error: ${errorMessage}`);
    }
  };
  

  return (
    <div className='p-5'>
       <div className="room-form-page">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Add New Room
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* General Room Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {role==="admin" &&
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hotels*
            </label>
            <select
              name="hotel_id"
              value={formData?.hotel_id || ''}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${
                errors.hotel_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm`}
            >
              <option value="">Select Hotel</option>
              {hoteldata.map((h)=>
                <option value={h._id}>{h.hotelName}</option>
              )}
            
            </select>
            {errors.hotel_id && <p className="text-red-500 text-xs mt-1">{errors.hotel_id}</p>}
          </div>
}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Room Number *
            </label>
            <input
              type="text"
              name="roomno"
              value={formData?.roomno || ''}
              onChange={handleChange}
              placeholder="e.g. 101A"
              className={`mt-1 block w-full p-2 border ${
                errors.roomno ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm`}
            />
            {errors.roomno && <p className="text-red-500 text-xs mt-1">{errors.roomno}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Room Type
            </label>
            <select
              name="roomtype"
              value={formData?.roomtype || 'single'}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price (per night) *
            </label>
            <input
              type="number"
              name="price"
              value={formData?.price || ''}
              onChange={handleChange}
              placeholder="150"
              className={`mt-1 block w-full p-2 border ${
                errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm`}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
        </div>

       
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isavailable"
            checked={formData?.isavailable ?? true}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <label className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
            Room Available for Booking
          </label>
        </div>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

     
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Room Facilities & Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Guests *
              </label>
              <input
                type="number"
                name="maxguests"
                value={formData?.facilities?.maxguests ?? ''}
                onChange={handleFacilityChange}
                className={`mt-1 block w-full p-2 border ${
                  errors.maxguests ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm`}
              />
              {errors.maxguests && <p className="text-red-500 text-xs mt-1">{errors.maxguests}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bed Type
              </label>
              <select
                name="bedtype"
                value={formData?.facilities?.bedtype || 'doublebed'}
                onChange={handleFacilityChange}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="singlebed">Single Bed</option>
                <option value="doublebed">Double Bed</option>
                <option value="queen">Queen</option>
                <option value="king">King</option>
              </select>
            </div>
          </div>

       
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'wifi', label: 'Wi-Fi' },
              { id: 'ac', label: 'Air Conditioning' },
              { id: 'tv', label: 'TV' },
              { id: 'minibar', label: 'Mini Bar' },
              { id: 'breakfastincluded', label: 'Breakfast Included' },
              { id: 'parking', label: 'Parking' },
              { id: 'roomservice', label: 'Room Service' },
              { id: 'laundry', label: 'Laundry' },
              { id: 'balcony', label: 'Balcony' },
              { id: 'smokingAllowed', label: 'Smoking Allowed' },
            ].map(({ id, label }) => (
              <label key={id} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  name={id}
                  checked={formData?.facilities?.[id] ?? false}
                  onChange={handleFacilityChange}
                  className="rounded text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

     
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Room Images Upload
          </h3>
          {errors.images && <p className="text-red-500 text-xs mb-3">{errors.images}</p>}

          <div className="grid grid-cols-1 gap-3">
            {['image1', 'image2', 'image3', 'image4', 'image5'].map((imgKey, index) => (
              <div key={imgKey}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Image {index + 1} {index === 0 && '*'}
                </label>
                <input
                  type="file"
                  name={imgKey}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className={`block w-full p-2 border ${
                    errors[imgKey] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-gray-600 file:text-blue-700 dark:file:text-gray-200 hover:file:bg-blue-100`}
                />
                {errors[imgKey] && <p className="text-red-500 text-xs mt-1">{errors[imgKey]}</p>}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition duration-150 shadow"
        >
          Add Room
        </button>
      </form>
    </div>
    </div>
  );
}

export default Roomaddform;
