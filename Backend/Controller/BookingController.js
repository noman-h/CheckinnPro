const booking = require('../Model/BookingModel')
const admins = require('../Model/AdminModel')
const hotels = require('../Model/HotelModel')
const rooms = require('../Model/RoomModel')
const users = require('../Model/UserModel')

exports.addbooking = async (req, res) => {
    try {
        const { userId, roomId, checkIn, checkOut, guests, totalPrice } = req.body

        if (!(userId && roomId && checkIn && checkOut && guests && totalPrice)) {
            return res.status(400).json({ message: "all fiels are required" })
        }

        const data = req.body
        const response = await booking.create({ ...data })

        return res.status(201).json({ message: "data saved" })

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "internal server error" })
    }
}


exports.getalladminbookings = async (req, res) => {
    try {
        const { sort, limit, skip } = req.query
        const search = req.query.search || ""

        let sorting
        if (sort === "newest") sorting = { $sort: { checkIn: -1 } }
        else if (sort === "oldest") sorting = { $sort: { checkIn: 1 } }

        const { owneremail } = req.params

        const admin = await admins.findOne({ owneremail })
        if (!admin) {
            return res.status(404).json({ message: "admin not found" })
        }

        const pipeline = [{
            $lookup: {
                from: "rooms",
                localField: "roomId",
                foreignField: "_id",
                as: "room"
            }
        },
        { $unwind: "$room" },
        {
            $match: {
                "room.roomno": { $regex: search, $options: 'i' }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $lookup: {
                from: "hotels",
                localField: "room.hotel_id",
                foreignField: "_id",
                as: "hotels"
            }
        },
        { $unwind: "$hotels" },
        {
            $match: {
                "hotels.admin_id": admin._id,
            }
        }
        ]

        const countresult = await booking.aggregate([...pipeline, { $count: 'totalcount' }])
        const totalcount = countresult[0]?.totalcount || 0;

        if (sort) pipeline.push(sorting)
        if (skip) pipeline.push({ $skip: parseInt(skip) })
        if (limit) pipeline.push({ $limit: parseInt(limit) })

        const response = await booking.aggregate(pipeline)

        return res.status(200).json({ response, totalcount })

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "internal server error" })
    }
}

exports.getallhotelbookings = async (req, res) => {
    try {
        const { search, sort, limit, skip } = req.query

        let sorting
        if (sort === "newest") sorting = { $sort: { checkIn: -1 } }
        else if (sort === "oldest") sorting = { $sort: { checkIn: 1 } }

        const { hotelEmail } = req.params

        const hotel = await hotels.findOne({ hotelEmail })
        if (!hotel) {
            return res.status(404).json({ message: "hotel not found" })
        }

        const pipeline = [{
            $lookup: {
                from: "rooms",
                localField: "roomId",
                foreignField: "_id",
                as: "room"
            }
        },
        { $unwind: "$room" },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $match: {
                "room.hotel_id": hotel._id,
                "room.roomno": { $regex: search, $options: 'i' }
            }
        }
        ]

        const countresult = await booking.aggregate([...pipeline, { $count: 'totalcount' }])
        const totalcount = countresult[0]?.totalcount || 0;

        if (sort) pipeline.push(sorting)
        if (skip) pipeline.push({ $skip: parseInt(skip) })
        if (limit) pipeline.push({ $limit: parseInt(limit) })

        const response = await booking.aggregate(pipeline)

        return res.status(200).json({ response, totalcount })

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "internal server error" })
    }
}

exports.allbooking = async (req, res) => {
    try {

        const result = await booking.find().populate('userId').populate('roomId')
        if (!result) {
            return res.status(404).json({ message: "booking not found" })
        }

        return res.status(200).json({ result })
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "internal server error" })
    }
}

exports.bookingview = async (req, res) => {
    try {
        const { bookid } = req.params
        if (!bookid) {
            return res.status(400).json({ message: "bad request no book id" })
        }

        const result = await booking.findById(bookid).populate('userId').populate('roomId')
        if (!result) {
            return res.status(404).json({ message: "booking not found" })
        }

        return res.status(200).json({ result })
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "internal server error" })
    }
}

exports.roombooking = async (req, res) => {
    try {
        const { roomid } = req.params
        if (!roomid) {
            return res.status(400).json({ message: "bad request no book id" })
        }

        const result = await booking.find({ roomId: roomid }).populate('roomId')
        if (!result) {
            return res.status(404).json({ message: "booking not found" })
        }

        return res.status(200).json({ result })
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "internal server error" })
    }
}

exports.userbookings = async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) {
            return res.status(400).json({ message: "bad request no book id" })
        }

        const user = await users.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        const result = await booking.find({ userId })
            .populate("userId")
            .populate({
                path: "roomId",
                populate: {
                    path: "hotel_id"
                }
            });

        if (!result) {
            return res.status(404).json({ message: "bookings not found" })
        }

        return res.status(200).json({ result })
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "internal server error" })
    }
}


exports.bookingcheckin = async (req, res) => {
    try {
        const { bookid } = req.params

        if (!bookid) {
            return res.status(400).json({ message: "bad request no book id" })
        }

        const existing = await booking.findById(bookid)
        if (!existing) {
            return res.status(404).json({ message: "booking not found" })
        }

        const result = await booking.findByIdAndUpdate(bookid, { bookingstatus: "active" })

        return res.status(200).json({ message: "checkin success" })
    }
    catch (err) {
        return res.status(500).json({ message: "internal server error" })
    }
}

exports.bookingcheckout = async (req, res) => {
    try {
        const { bookid } = req.params

        if (!bookid) {
            return res.status(400).json({ message: "bad request no book id" })
        }

        const existing = await booking.findById(bookid)
        if (!existing) {
            return res.status(404).json({ message: "booking not found" })
        }

        const result = await booking.findByIdAndUpdate(bookid, { bookingstatus: "completed" })
        return res.status(200).json({ message: "checkout success" })
    }
    catch (err) {
        return res.status(500).json({ message: "internal server error" })
    }
}

exports.bookingcancel = async (req, res) => {
    try {
        const { bookid } = req.params

        if (!bookid) {
            return res.status(400).json({ message: "bad request no book id" })
        }

        const existing = await booking.findById(bookid)
        if (!existing) {
            return res.status(404).json({ message: "booking not found" })
        }

        const result = await booking.findByIdAndUpdate(bookid, { bookingstatus: "cancelled" })

        return res.status(200).json({ message: "cancel success" })
    }
    catch (err) {
        return res.status(500).json({ message: "internal server error" })
    }
}

exports.bookingreview = async (req, res) => {
    try {
        const { bookid } = req.params

        if (!bookid) {
            return res.status(400).json({ message: "bad request no book id" })
        }

        const existing = await booking.findById(bookid)
        if (!existing) {
            return res.status(404).json({ message: "booking not found" })
        }

        const result = await booking.findByIdAndUpdate(bookid, { bookingreview: true })

        return res.status(200).json({ message: "review success" })
    }
    catch (err) {
        return res.status(500).json({ message: "internal server error" })
    }
}