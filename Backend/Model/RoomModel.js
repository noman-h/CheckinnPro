const mongoose=require('mongoose')

const roomSchema=mongoose.Schema({
   hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hotels",
    required: true,
  },

  roomno: {
    type: String,
    required: true,
  },

  roomtype: {
    type: String,
    enum: ["single", "double", "deluxe", "suite"],
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  isavailable: {
    type: Boolean,
    default: true,
  },
  activestatus:{
    type:Boolean,
    default:true,
  },
  facilities: {
    wifi: {
      type: Boolean,
      default: false
    },
    ac: {
      type: Boolean,
      default: false
    },
    tv: {
      type: Boolean,
      default: false
    },
    minibar: {
      type: Boolean,
      default: false
    },
    breakfastincluded: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    roomservice: {
      type: Boolean,
      default: false
    },
    laundry: {
      type: Boolean,
      default: false
    },
    balcony: {
      type: Boolean,
      default: false
    },
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    maxguests: {
      type: Number,
      default: 2
    },
    bedtype: {
      type: String,
      enum: ["singlebed", "doublebed", "queen", "king"],
      default: "doublebed"
    }
  },
  image1:{
    type:String
  },
  image2:{
    type:String
  },
  image3:{
    type:String
  },
  image4:{
    type:String
  },
  image5:{
    type:String
  },
}, {
  timestamps: true
});


module.exports=mongoose.model("rooms",roomSchema)