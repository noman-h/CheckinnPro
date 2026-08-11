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
        const { search = '', sort, limit, skip } = req.query

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
        const { search = '', sort = 'newest', range = 'alltime', startDate, endDate, skip, limit } = req.query;

        // --- Date Range Filter ---
        const now = new Date();
        let dateFilter = {};
        if (range === 'week') {
            const from = new Date();
            from.setDate(now.getDate() - 7);
            from.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: from } };
        } else if (range === '6months') {
            const from = new Date();
            from.setMonth(now.getMonth() - 6);
            from.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: from } };
        } else if (range === 'custom' && startDate && endDate) {
            const from = new Date(startDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(endDate);
            to.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: from, $lte: to } };
        }

        // --- Sort ---
        let sorting = { createdAt: -1 };
        if (sort === 'oldest') sorting = { createdAt: 1 };
        else if (sort === 'highprice') sorting = { totalPrice: -1 };
        else if (sort === 'lowprice') sorting = { totalPrice: 1 };

        // --- Build Aggregation Pipeline ---
        const pipeline = [
            { $match: dateFilter },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId'
                }
            },
            { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'roomId'
                }
            },
            { $unwind: { path: '$roomId', preserveNullAndEmptyArrays: true } },
        ];

        // --- Search Filter (after lookup so we can search user name) ---
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            pipeline.push({
                $match: {
                    $or: [
                        { 'userId.name': searchRegex },
                        { 'userId.email': searchRegex },
                        { 'bookingstatus': searchRegex },
                    ]
                }
            });
        }

        // Count before pagination
        const countResult = await booking.aggregate([...pipeline, { $count: 'totalcount' }]);
        const totalcount = countResult[0]?.totalcount || 0;

        // Sort + Paginate
        pipeline.push({ $sort: sorting });
        if (skip) pipeline.push({ $skip: parseInt(skip) });
        if (limit) pipeline.push({ $limit: parseInt(limit) });

        const result = await booking.aggregate(pipeline);

        return res.status(200).json({ result, totalcount });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "internal server error" });
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
            return res.status(400).json({ message: "bad request no user id" })
        }

        const user = await users.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        const { range, startDate, endDate } = req.query;

        let query = { userId };

        const now = new Date();

        if (range === '1week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            oneWeekAgo.setHours(0, 0, 0, 0);
            query.checkIn = { $gte: oneWeekAgo };
        } else if (range === '6month' || range === '6months') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            sixMonthsAgo.setHours(0, 0, 0, 0);
            query.checkIn = { $gte: sixMonthsAgo };
        } else if (range === '1year' || range === 'year') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            oneYearAgo.setHours(0, 0, 0, 0);
            query.checkIn = { $gte: oneYearAgo };
        } else if (range === 'custom' || (startDate && endDate)) {
            const dateFilter = {};
            if (startDate) {
                const sDate = new Date(startDate);
                sDate.setHours(0, 0, 0, 0);
                dateFilter.$gte = sDate;
            }
            if (endDate) {
                const eDate = new Date(endDate);
                eDate.setHours(23, 59, 59, 999);
                dateFilter.$lte = eDate;
            }
            if (Object.keys(dateFilter).length > 0) {
                query.checkIn = dateFilter;
            }
        }

        const result = await booking.find(query)
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

