const mongoose=require('mongoose')

const districtschema=mongoose.Schema({
    districtname:{
        type:String,
        required:true
    },
    state_id:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'states',
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

module.exports=mongoose.model('districts',districtschema)