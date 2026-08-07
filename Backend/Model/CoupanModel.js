const mongoose = require("mongoose");

const coupanSchema=mongoose.Schema({
    hotel_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'hotels',
        required:true
    },
    coupancode:{
        type:String,
         required:true
    },
    discount:{
        type:Number,
        required:true
    },
    startdate:{
        type:Date,
        required:true
    },
    enddate:{
        type:Date,
        required:true
    },
    maxprice:{
        type:Number,
        required:true
    },
    activestatus:{
        type:Boolean,
        default:true 
    }
})

module.exports=mongoose.model('coupans',coupanSchema)