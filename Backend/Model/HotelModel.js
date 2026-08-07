const mongoose = require("mongoose");

const HotelSchema = mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    CityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cities",
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    totalRooms: {
      type: Number,
      required: true,
    },
    activeStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    hotelEmail: {
      type: String,
      required: true,
    },
    hotelPhone: {
      type: String,
      required: true,
    },
    images:{
      type:String
    },
    approveStatus: {
      type: String,
      required: true,
      default: "pending",
    },
    checkid: {
      type: String,
      default: null,
    },
    admin_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true
    },
     otp:{
        type:Number,
        default:null
    },
     expiretime:{
        type:Date
    }  
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("hotels",HotelSchema);
