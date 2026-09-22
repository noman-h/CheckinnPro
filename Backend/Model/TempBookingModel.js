const mongoose=require('mongoose')

const tempbookschema=mongoose.Schema({
    roomId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"rooms",
        unique:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"users"
    },
    bookingstatus: {
        type:String,
        enum:["temprorarybook"],
        default:"temprorarybook"
    },
    expiretime: { 
    type: Date,
    expires: 600 
  }
},{
    timestamp:true
})

module.exports=mongoose.model('tempbookings',tempbookschema)