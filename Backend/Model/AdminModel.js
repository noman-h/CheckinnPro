const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  ownername: {
    type: String,
    required: true,
  },

  owneremail: {
    type: String,
    required: true,
    unique: true,
  },

  ownerphone: {
    type: String,
    required: true,
  },

  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cities",
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  aadhaarNumber: {
    type: String,
  },

  profileImage: {
    type: String,
  },

  aadhaarFront: {
    type: String,
  },

  aadhaarBack: {
    type: String,
  },

  role: {
    type: String,
    default: "hotelowner",
  },

  checkid: {
      type: String,
      default: null,
    }, 

  activeStatus: {
    type: Boolean,
    default: false,
  },

  approveStatus: {
      type: String,
      required: true,
      default: "pending",
    },
    
   otp:{
        type:Number,
        default:null
    },
     expiretime:{
        type:Date
    }
}, {
  timestamps: true,
});

module.exports = mongoose.model("admins",adminSchema);