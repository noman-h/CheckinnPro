const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rooms",
        required: true
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    guests: {
        type: Number,
        default: 1
    },

    totalPrice: {
        type: Number,
        required: true
    },
    bookingstatus: {
        type: String,
        enum: ["pending", "cancelled", "active", "completed"],
        default: "pending",
    },
    bookingreview:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
})

module.exports=mongoose.model('bookins',BookingSchema)