const mongoose=require('mongoose')

const reviewschema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users',
    },
    hotelId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'rooms',
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true
    },
    reviewtext:{
        type:String,
        trim:true
    }
},
{
    timestamps:true
})

module.exports=mongoose.model('reviews',reviewschema)