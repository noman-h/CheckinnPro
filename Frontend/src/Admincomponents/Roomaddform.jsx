import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function Roomaddform() {
  const navigate = useNavigate();
  const { roomid } = useParams();

  const role = localStorage.getItem("user");
  const hotelemail = localStorage.getItem("email");
  const hotelid = localStorage.getItem("userid");
  const token = localStorage.getItem("token");

  const [hoteldata, sethoteldata] = useState([]);

  const [formData, setFormData] = useState({
    hotel_id: "",
    roomno: "",
    roomtype: "single",
    price: "",
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
      bedtype: "doublebed",
    },

    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
  });

  const [existingImages, setExistingImages] = useState({
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
  });

  const [errors, setErrors] = useState({});

  // ==============================
  // LOGOUT
  // ==============================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userid");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("theme");

    navigate("/login");
  };

  // ==============================
  // FETCH HOTELS
  // ==============================

  const fetchhotels = async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/hotel/getalladminhotels/${hotelemail}?search&sort&status=active&skip&limit`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      sethoteldata(result?.data?.response || []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }

      console.log(err);
    }
  };

  // ==============================
  // FETCH ROOM FOR UPDATE
  // ==============================

  const fetchRoom = async () => {
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/room/getoneroom/${roomid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const room = result?.data?.response;

      if (!room) {
        alert("Room not found");
        navigate(-1);
        return;
      }

      const roomHotelId =
        room.hotel_id?._id ||
        room.hotel_id ||
        "";

      setExistingImages({
        image1: room.image1 || "",
        image2: room.image2 || "",
        image3: room.image3 || "",
        image4: room.image4 || "",
        image5: room.image5 || "",
      });

      setFormData({
        hotel_id: roomHotelId,

        roomno: room.roomno || "",

        roomtype: room.roomtype || "single",

        price: room.price ?? "",

        isavailable: room.isavailable ?? true,

        facilities: {
          wifi: room.facilities?.wifi ?? false,
          ac: room.facilities?.ac ?? false,
          tv: room.facilities?.tv ?? false,
          minibar: room.facilities?.minibar ?? false,
          breakfastincluded:
            room.facilities?.breakfastincluded ?? false,
          parking: room.facilities?.parking ?? false,
          roomservice: room.facilities?.roomservice ?? false,
          laundry: room.facilities?.laundry ?? false,
          balcony: room.facilities?.balcony ?? false,
          smokingAllowed:
            room.facilities?.smokingAllowed ?? false,
          maxguests:
            room.facilities?.maxguests ?? 2,
          bedtype:
            room.facilities?.bedtype || "doublebed",
        },

        // File input cannot contain an existing URL.
        image1: null,
        image2: null,
        image3: null,
        image4: null,
        image5: null,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }

      console.error("Failed to fetch room:", err);

      alert(
        err.response?.data?.message ||
          "Failed to load room"
      );
    }
  };

  // ==============================
  // USE EFFECT
  // ==============================

  useEffect(() => {
    fetchhotels();

    if (roomid) {
      fetchRoom();
    } else if (role === "hotel") {
      setFormData((prev) => ({
        ...prev,
        hotel_id: hotelid || "",
      }));
    }
  }, [roomid]);

  // ==============================
  // VALIDATION
  // ==============================

  const validateForm = (data = formData) => {
    const newErrors = {};

    if (!data.hotel_id?.trim()) {
      newErrors.hotel_id =
        "Please select a Hotel.";
    }

    if (!data.roomno?.trim()) {
      newErrors.roomno =
        "Room number is required.";
    }

    if (!data.price) {
      newErrors.price =
        "Price is required.";
    } else if (Number(data.price) <= 0) {
      newErrors.price =
        "Price must be greater than 0.";
    }

    if (
      data.facilities.maxguests === "" ||
      data.facilities.maxguests === null ||
      data.facilities.maxguests === undefined
    ) {
      newErrors.maxguests =
        "Max guests is required.";
    } else if (
      Number(data.facilities.maxguests) < 1
    ) {
      newErrors.maxguests =
        "Max guests must be at least 1.";
    }

    const imageKeys = [
      "image1",
      "image2",
      "image3",
      "image4",
      "image5",
    ];

    const hasNewImage = imageKeys.some(
      (key) => data[key] !== null
    );

    const hasExistingImage = imageKeys.some(
      (key) => existingImages[key]
    );

    if (
      !hasNewImage &&
      !hasExistingImage
    ) {
      newErrors.images =
        "Please upload at least one room image.";
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    imageKeys.forEach((key) => {
      const file = data[key];

      if (file) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          newErrors[key] =
            "Only JPG, PNG, and WEBP formats are allowed.";
        } else if (file.size > MAX_FILE_SIZE) {
          newErrors[key] =
            "File size must be less than 5MB.";
        }
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==============================
  // NORMAL INPUT CHANGE
  // ==============================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // ==============================
  // FILE CHANGE
  // ==============================

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    const selectedFile =
      files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      [name]: selectedFile,
    }));

    if (errors[name] || errors.images) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
        images: null,
      }));
    }
  };

  // ==============================
  // FACILITY CHANGE
  // ==============================

  const handleFacilityChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      facilities: {
        ...prev.facilities,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      },
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // ==============================
  // SUBMIT
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalHotelId =
      role === "hotel"
        ? hotelid
        : formData.hotel_id;

    const finalFormData = {
      ...formData,
      hotel_id: finalHotelId || "",
    };

    if (!validateForm(finalFormData)) {
      return;
    }

    const payload = new FormData();

    payload.append(
      "hotel_id",
      finalFormData.hotel_id
    );

    payload.append(
      "roomno",
      finalFormData.roomno
    );

    payload.append(
      "roomtype",
      finalFormData.roomtype
    );

    payload.append(
      "price",
      finalFormData.price
    );

    payload.append(
      "isavailable",
      finalFormData.isavailable
    );

    payload.append(
      "facilities",
      JSON.stringify(
        finalFormData.facilities
      )
    );

    // ==============================
    // ADD NEW IMAGES ONLY
    // ==============================

    [
      "image1",
      "image2",
      "image3",
      "image4",
      "image5",
    ].forEach((key) => {
      if (finalFormData[key]) {
        payload.append(
          key,
          finalFormData[key]
        );
      }
    });

    try {
      let response;

      // ==============================
      // UPDATE
      // ==============================

      if (roomid) {
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/room/updateroom/${roomid}`,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      }

      // ==============================
      // ADD
      // ==============================

      else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/room/addroom`,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      }

      // ==============================
      // SUCCESS
      // ==============================

      if (
        response.status === 200 ||
        response.status === 201
      ) {
        alert(
          roomid
            ? "Room updated successfully!"
            : "Room added successfully!"
        );
      }

    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }

      console.error(
        "Submission failed:",
        err
      );

      const errorMessage =
        err.response?.data?.message ||
        "Failed to save room details.";

      alert(
        `Error: ${errorMessage}`
      );
    }
  };

  // ==============================
  // RETURN
  // ==============================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {roomid
                ? "Update Room"
                : "Add New Room"}
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {roomid
                ? "Update the room details below."
                : "Add a new room to your hotel."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Back
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
        >

          {/* GENERAL ROOM INFORMATION */}

          <div>

            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              General Room Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* HOTEL */}

              {role === "admin" && (
                <div>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hotel *
                  </label>

                  <select
                    name="hotel_id"
                    value={
                      formData.hotel_id || ""
                    }
                    onChange={handleChange}
                    className={`mt-1 block w-full p-2 border ${
                      errors.hotel_id
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm`}
                  >

                    <option value="">
                      Select Hotel
                    </option>

                    {hoteldata.map((h) => (
                      <option
                        key={h._id}
                        value={h._id}
                      >
                        {h.hotelName}
                      </option>
                    ))}

                  </select>

                  {errors.hotel_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.hotel_id}
                    </p>
                  )}

                </div>
              )}

              {/* ROOM NUMBER */}

              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Room Number *
                </label>

                <input
                  type="text"
                  name="roomno"
                  value={
                    formData.roomno || ""
                  }
                  onChange={handleChange}
                  placeholder="e.g. 101A"
                  className={`mt-1 block w-full p-2 border ${
                    errors.roomno
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm`}
                />

                {errors.roomno && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.roomno}
                  </p>
                )}

              </div>

              {/* ROOM TYPE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Room Type
                </label>

                <select
                  name="roomtype"
                  value={
                    formData.roomtype ||
                    "single"
                  }
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm"
                >

                  <option value="single">
                    Single
                  </option>

                  <option value="double">
                    Double
                  </option>

                  <option value="deluxe">
                    Deluxe
                  </option>

                  <option value="suite">
                    Suite
                  </option>

                </select>

              </div>

              {/* PRICE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price (per night) *
                </label>

                <input
                  type="number"
                  name="price"
                  value={
                    formData.price || ""
                  }
                  onChange={handleChange}
                  placeholder="150"
                  className={`mt-1 block w-full p-2 border ${
                    errors.price
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm`}
                />

                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.price}
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* AVAILABILITY */}

          <div className="flex items-center">

            <input
              type="checkbox"
              name="isavailable"
              checked={
                formData.isavailable ?? true
              }
              onChange={handleChange}
              className="h-4 w-4 text-blue-600"
            />

            <label className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              Room Available for Booking
            </label>

          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* FACILITIES */}

          <div>

            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Room Facilities & Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* MAX GUESTS */}

              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Guests *
                </label>

                <input
                  type="number"
                  name="maxguests"
                  value={
                    formData.facilities
                      ?.maxguests ?? ""
                  }
                  onChange={
                    handleFacilityChange
                  }
                  className={`mt-1 block w-full p-2 border ${
                    errors.maxguests
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm`}
                />

                {errors.maxguests && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.maxguests}
                  </p>
                )}

              </div>

              {/* BED TYPE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bed Type
                </label>

                <select
                  name="bedtype"
                  value={
                    formData.facilities
                      ?.bedtype ||
                    "doublebed"
                  }
                  onChange={
                    handleFacilityChange
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm"
                >

                  <option value="singlebed">
                    Single Bed
                  </option>

                  <option value="doublebed">
                    Double Bed
                  </option>

                  <option value="queen">
                    Queen
                  </option>

                  <option value="king">
                    King
                  </option>

                </select>

              </div>

            </div>

            {/* FACILITY CHECKBOXES */}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

              {[
                {
                  id: "wifi",
                  label: "Wi-Fi",
                },
                {
                  id: "ac",
                  label: "Air Conditioning",
                },
                {
                  id: "tv",
                  label: "TV",
                },
                {
                  id: "minibar",
                  label: "Mini Bar",
                },
                {
                  id: "breakfastincluded",
                  label: "Breakfast Included",
                },
                {
                  id: "parking",
                  label: "Parking",
                },
                {
                  id: "roomservice",
                  label: "Room Service",
                },
                {
                  id: "laundry",
                  label: "Laundry",
                },
                {
                  id: "balcony",
                  label: "Balcony",
                },
                {
                  id: "smokingAllowed",
                  label: "Smoking Allowed",
                },
              ].map(({ id, label }) => (

                <label
                  key={id}
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                >

                  <input
                    type="checkbox"
                    name={id}
                    checked={
                      formData.facilities?.[
                        id
                      ] ?? false
                    }
                    onChange={
                      handleFacilityChange
                    }
                    className="rounded text-blue-600"
                  />

                  <span>
                    {label}
                  </span>

                </label>

              ))}

            </div>

          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* IMAGES */}

          <div>

            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Room Images
            </h3>

            {errors.images && (
              <p className="text-red-500 text-xs mb-3">
                {errors.images}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4">

              {[
                "image1",
                "image2",
                "image3",
                "image4",
                "image5",
              ].map(
                (imgKey, index) => (

                  <div
                    key={imgKey}
                    className="border rounded-lg p-3"
                  >

                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Image {index + 1}
                      {!roomid &&
                        index === 0 &&
                        " *"}
                    </label>

                    {/* EXISTING IMAGE */}

                    {roomid &&
                      existingImages[
                        imgKey
                      ] && (

                        <div className="mb-2">

                          <img
                            src={
                              existingImages[
                                imgKey
                              ]
                            }
                            alt={`Room ${
                              index + 1
                            }`}
                            className="w-32 h-24 object-cover rounded-md border"
                          />

                          <p className="text-xs text-gray-500 mt-1">
                            Existing image
                          </p>

                        </div>

                      )}

                    {/* NEW IMAGE */}

                    <input
                      type="file"
                      name={imgKey}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        handleFileChange
                      }
                      className={`block w-full p-2 border ${
                        errors[imgKey]
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm text-sm`}
                    />

                    {errors[imgKey] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[imgKey]}
                      </p>
                    )}

                    {formData[
                      imgKey
                    ] && (
                      <p className="text-xs text-green-600 mt-1">
                        New image selected:{" "}
                        {
                          formData[
                            imgKey
                          ].name
                        }
                      </p>
                    )}

                  </div>

                )
              )}

            </div>

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition duration-150 shadow"
          >
            {roomid
              ? "Update Room"
              : "Add Room"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Roomaddform;