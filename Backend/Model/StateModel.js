const mongoose=require('mongoose')

const stateschema=mongoose.Schema({
    statename:{
        type:String,
        required:true
    },
    country:{
         type:String,
         default:"India"
    },
    activestatus:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true
})

module.exports=mongoose.model('states',stateschema)