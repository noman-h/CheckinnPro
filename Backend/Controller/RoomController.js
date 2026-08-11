const rooms = require("../Model/RoomModel");
const hotels = require("../Model/HotelModel");
const admins = require("../Model/AdminModel");
const { uploadimage } = require("../Utils/FileUpload");
const { default: mongoose } = require("mongoose");
const xlsx = require("xlsx");

exports.roomadd = async (req, res) => {
  try {
    let { hotel_id, roomno, roomtype, price, facilities } = req.body;

    if (!(hotel_id && roomno && roomtype && price && facilities)) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    if (typeof facilities === "string") {
      try {
        facilities = JSON.parse(facilities);
      } catch (e) {
        return res.status(400).json({ message: "Invalid facilities format." });
      }
    }

    const existing = await rooms.findOne({ hotel_id, roomno });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Room number already exists for this hotel." });
    }

    let image1 = null,
      image2 = null,
      image3 = null,
      image4 = null,
      image5 = null;

    if (req.files && Object.keys(req.files).length > 0) {
      const uploaddata = await uploadimage(req.files);
      image1 = uploaddata[0]?.url || null;
      image2 = uploaddata[1]?.url || null;
      image3 = uploaddata[2]?.url || null;
      image4 = uploaddata[3]?.url || null;
      image5 = uploaddata[4]?.url || null;
    }

    const newRoom = await rooms.create({
      hotel_id,
      roomno,
      roomtype,
      price,
      isavailable: req.body.isavailable ?? true,
      facilities,
      image1,
      image2,
      image3,
      image4,
      image5,
    });

    return res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (err) {
    console.error("Error in roomadd:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.roomupdate = async (req, res) => {
  try {
    let { hotel_id, roomno, roomtype, price, facilities } = req.body;
    const {roomid}=req.params

    if (!(roomid && hotel_id && roomno && roomtype && price && facilities)) {
      return res
        .status(400)
        .json({ message: "All fields including _id are required." });
    }

    if (typeof facilities === "string") {
      facilities = JSON.parse(facilities);
    }

    const existing = await rooms.findById(roomid);
    if (!existing) {
      return res.status(404).json({ message: "Room not found." });
    }

    let image1 = existing.image1;
    let image2 = existing.image2;
    let image3 = existing.image3;
    let image4 = existing.image4;
    let image5 = existing.image5;

    if (req.files && Object.keys(req.files).length > 0) {
      const uploaddata = await uploadimage(req.files);
      if (uploaddata[0]) image1 = uploaddata[0].url;
      if (uploaddata[1]) image2 = uploaddata[1].url;
      if (uploaddata[2]) image3 = uploaddata[2].url;
      if (uploaddata[3]) image4 = uploaddata[3].url;
      if (uploaddata[4]) image5 = uploaddata[4].url;
    }

    const updatedRoom = await rooms.findByIdAndUpdate(
      roomid,
      {
        hotel_id,
        roomno,
        roomtype,
        price,
        isavailable: req.body.isavailable ?? existing.isavailable,
        facilities,
        image1,
        image2,
        image3,
        image4,
        image5,
      },
      { new: true },
    );

    return res
      .status(200)
      .json({ message: "Room updated successfully", room: updatedRoom });
  } catch (err) {
    console.error("Error in roomupdate:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.roomreadall = async (req, res) => {
  try {
    const response = await rooms.find().populate("hotel_id");
    return res.status(200).json({ response });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.roomreadhotelall = async (req, res) => {
  try {
    const { search, status, sort, priceRange, price, roomType, amenities, facilities, skip, limit } = req.query;

    const { hotelEmail } = req.params;

    const hotel = await hotels.findOne({ hotelEmail });
    if (!hotel) {
      return res.status(404).json({ message: "hotel not found" });
    }

    const matchQuery = {
      hotel_id: hotel._id,
      activestatus: status === "active" ? true : status === "inactive" ? false : true,
    };

    // Search filter
    if (search) {
      matchQuery.$or = [
        { roomno: { $regex: search, $options: "i" } },
        { roomtype: { $regex: search, $options: "i" } },
      ];
    }

    // Room Type filter
    if (roomType && roomType !== "all") {
      matchQuery.roomtype = roomType;
    }

    // Price Range filter
    const selectedPrice = priceRange || price;
    if (selectedPrice && selectedPrice !== "all") {
      if (selectedPrice === "0-1000") {
        matchQuery.price = { $gte: 0, $lte: 1000 };
      } else if (selectedPrice === "1000-2000") {
        matchQuery.price = { $gte: 1000, $lte: 2000 };
      } else if (selectedPrice === "2000+") {
        matchQuery.price = { $gte: 2000 };
      }
    }

    // Amenities / Facilities filter
    if (amenities) {
      const list = amenities.split(",").map(item => item.trim()).filter(Boolean);
      list.forEach(item => {
        matchQuery[`facilities.${item}`] = true;
      });
    }

    if (facilities) {
      try {
        const parsedFac = typeof facilities === "string" ? JSON.parse(facilities) : facilities;
        Object.keys(parsedFac).forEach(key => {
          if (parsedFac[key] === true || parsedFac[key] === "true") {
            matchQuery[`facilities.${key}`] = true;
          }
        });
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // Direct facility flag query support
    const facilityKeys = [
      "wifi", "ac", "tv", "minibar", "breakfastincluded",
      "parking", "roomservice", "laundry", "balcony", "smokingAllowed"
    ];
    facilityKeys.forEach(key => {
      if (req.query[key] === "true" || req.query[key] === true) {
        matchQuery[`facilities.${key}`] = true;
      }
    });

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sort === "az" || sort === "price_asc" || sort === "low_to_high") {
      sortOptions = { price: 1 };
    } else if (sort === "za" || sort === "price_desc" || sort === "high_to_low") {
      sortOptions = { price: -1 };
    } else if (sort === "newest") {
      sortOptions = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    const totalcount = await rooms.countDocuments(matchQuery);

    let query = rooms.find(matchQuery).populate("hotel_id").sort(sortOptions);

    if (skip) query = query.skip(parseInt(skip));
    if (limit) query = query.limit(parseInt(limit));

    const response = await query;

    return res.status(200).json({ response, totalcount });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.roomreadadminhotelall = async (req, res) => {
  try {
    const { search, status, sort, limit, skip } = req.query;


    const { adminemail } = req.params;

    const admin = await admins.findOne({ owneremail: adminemail });

    const hotelMatch = {
      admin_id: admin._id,
      activeStatus: true
    };

    if (sort) { hotelMatch._id = new mongoose.Types.ObjectId(sort); }

    const adminHotels = await hotels.find(hotelMatch).select("_id");
    const hotelIds = adminHotels.map(h => h._id);

    const roomMatch = {
      hotel_id: { $in: hotelIds },
      activestatus: status === "active" ? true : false,
    };

    if (search) {
      roomMatch.$or = [
        { roomtype: { $regex: search, $options: "i" } },
        { roomno: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await rooms.countDocuments(roomMatch);

    let query = rooms.find(roomMatch).populate("hotel_id").sort({ createdAt: -1 });

    if (skip) query = query.skip(parseInt(skip));
    if (limit) query = query.limit(parseInt(limit));

    const response = await query;
    return res.status(200).json({ response, totalCount });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.roomreadone = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await rooms.findOne({ _id: id }).populate("hotel_id");
    if (!response) {
      return res.status(404).json({ message: "Room not found" });
    }
    return res.status(200).json({ response });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.roomdelete = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    await rooms.findByIdAndDelete(id);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.roomsoftdelete = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    await rooms.findByIdAndUpdate(id, { activestatus: false });
    return res
      .status(200)
      .json({ message: "Temporary deleted (marked unavailable)" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.roomrecoverdelete = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    await rooms.findByIdAndUpdate(id, { activestatus: true });
    return res.status(200).json({ message: "Restored successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.roombulkimport = async (req, res) => {
    try {
        const { hotel_id } = req.body;
        if (!hotel_id) {
            return res.status(400).json({ message: "hotel_id is required" });
        }

        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.files.file;
        const workbook = xlsx.read(file.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        if (!jsonData || jsonData.length === 0) {
            return res.status(400).json({ message: "File is empty or invalid format" });
        }

        const validRooms = [];
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const { roomno, roomtype, price } = row;

            if (!roomno || !roomtype || !price) {
                errors.push(`Row ${i + 2}: Missing required fields (roomno, roomtype, price)`);
                continue;
            }

            const existing = await rooms.findOne({ roomno, hotel_id });
            if (existing) {
                errors.push(`Row ${i + 2}: Room ${roomno} already exists in this hotel`);
                continue;
            }

            validRooms.push({
                hotel_id,
                roomno: String(roomno),
                roomtype: String(roomtype).toLowerCase(),
                price: Number(price),
                isavailable: true,
                activestatus: true
            });
        }

        if (validRooms.length > 0) {
            await rooms.insertMany(validRooms);
        }

        return res.status(200).json({
            message: "Bulk import completed",
            imported: validRooms.length,
            errors: errors
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
