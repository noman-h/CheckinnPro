const tempbook=require('../Model/TempBookingModel')
const rooms=require("../Model/RoomModel")
const moment=require('moment')

exports.tempbooking=async (req,res)=>{
    try{
     const {roomId,userId}=req.body

     if(!roomId){
        return res.status(400).json({message:"bad request room id not found"})
     }

     const room=await rooms.findById(roomId) 
     if(!room){
        return res.status(404).json({message:"room not found"})
     }

     const existing=await tempbook.findOne({roomId})
     if(existing){
        return res.status(200).json({message:"room already booked"})
     }
     
     const response=await tempbook.create({roomId,userId,expiretime:moment().format()})
     return res.status(201).json({message:"temprorary booked"})
   }
   catch(err){
    console.log(err);
    return res.status(500).json({message:"internal server error"})
   }
}

exports.gettempbooking=async (req,res)=>{
    try{
  
    const {roomId}=req.params

     if(!roomId){
        return res.status(400).json({message:"bad request room id not found"})
     }
     
     const room=await tempbook.findOne({roomId}) 
     return res.status(200).json({room})
      
    }
    catch(err){
      console.log(err);
      
        return res.status(500).json({message:"internal server error"})
    }
}