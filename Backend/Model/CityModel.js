const mongoose=require('mongoose')

const cityschema=mongoose.Schema({
    cityname:{
        type:String,
        required:true
    },
    district_id:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'districts',
         required:true
    },
     activestatus:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true
})

module.exports=mongoose.model('cities',cityschema)