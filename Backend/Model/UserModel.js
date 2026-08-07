const mongoose=require('mongoose')

const userschema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    phone:{
        type:Number
    }
    ,
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user"
    },
    hotel_id:{
       type:mongoose.Schema.Types.ObjectId,
        required:false
    },
    admin_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:false
    },
    theme:{
       type:String,
       default:"light"
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
    timestamps:true,
    versionkey:false
})

module.exports=mongoose.model('users',userschema)

