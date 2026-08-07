const rooms = require("../Model/RoomModel");
const hotels = require("../Model/HotelModel");
const admins = require("../Model/AdminModel");
const { uploadimage } = require("../Utils/FileUpload");
const { default: mongoose } = require("mongoose");

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
    let { _id, hotel_id, roomno, roomtype, price, facilities } = req.body;

    if (!(_id && hotel_id && roomno && roomtype && price && facilities)) {
      return res
        .status(400)
        .json({ message: "All fields including _id are required." });
    }

    if (typeof facilities === "string") {
      facilities = JSON.parse(facilities);
    }

    const existing = await rooms.findById(_id);
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
      _id,
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
    const { search, status } = req.query;

    const { hotelEmail } = req.params;

    const hotel = await hotels.findOne({ hotelEmail });
    if (!hotel) {
      return res.status(404).json({ message: "hotel not found" });
    }

    const response = await rooms
      .find({
        hotel_id: hotel._id,
        activestatus: status === "active" ? true : false,
        $or: [
          { roomno: { $regex: search, $options: "i" } },
          { roomtype: { $regex: search, $options: "i" } },
        ],
      })
      .populate("hotel_id");
    return res.status(200).json({ response });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.roomreadadminhotelall = async (req, res) => {
  try {
    const { search, status, sort ,limit ,skip } = req.query;
    console.log(req.query);
    
    const { adminemail } = req.params;

    const admin = await admins.findOne({ owneremail: adminemail });

    const hotelMatch = { admin_id: admin._id,
                        activeStatus:true
                        };

    if (sort) { hotelMatch._id = new mongoose.Types.ObjectId(sort); }

    const roompipeline=[
            {
              $match: {
                activestatus: (status==="active") ? true : false,
                $expr: { $eq: ["$hotel_id", "$$hotelId"] },
                ...(search && {
                  $or: [
                    { roomtype: { $regex: search, $options: "i" } },
                    { roomno: { $regex: search, $options: "i" } },
                  ],
                }),
              },
            }
          ]
      
    const hotelpipeline=[
      { $match: hotelMatch },
      {
        $lookup: {
          from: "rooms",
          let: { hotelId: "$_id" },
          pipeline: roompipeline,
          as: "roomarray",
        },
      },
      { $match: { "roomarray.0": { $exists: true } } },
    ]   
    
    const roomCountPipeline = [
  { $match: hotelMatch },
  {
    $lookup: {
      from: "rooms",
      let: { hotelId: "$_id" },
      pipeline: roompipeline,
      as: "roomarray",
    },
  },
  { $unwind: "$roomarray" },
  { $count: "totalRooms" }
];

    const countResult = await hotels.aggregate(roomCountPipeline);
    const totalCount = countResult[0]?.totalRooms || 0;

    if(skip)  roompipeline.push({$skip:parseInt(skip)})
    if(limit) roompipeline.push({$limit:parseInt(limit)})

    const response = await hotels.aggregate(hotelpipeline);
    return res.status(200).json({ response,totalCount });
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
