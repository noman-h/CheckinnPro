const tempbook=require('../Model/TempBookingModel')
const rooms=require("../Model/RoomModel")
const moment=require('moment')
const mongoose=require('mongoose')

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

     const existing=await tempbook.findOne({
  roomId: roomId,
  bookingstatus: "temprorarybook",
  expiretime: { $gt: new Date() }
})

console.log("<<<",existing);
console.log(userId);


if (existing) {
   console.log("exis",existing.userId);
   
   const userid=new mongoose.Types.ObjectId(userId)
   console.log(userid);
   
   if(existing.userId!==userid){
      return res.status(409).json({
    message: "Room is temporarily held by another user"
  });
   }
   else{
      return res.status(200).json({message :"already temp booked"})
   }
}
     
     const response=await tempbook.create({roomId,userId, expiretime: moment().add(10, 'minutes').toDate()})

     return res.status(201).json({message:"temprorary booked"})
   }
   catch(err){
    console.log(err);
    return res.status(500).json({message:"internal server error"})
   }
}

exports.gettempbooking=async (req,res)=>{
    try{
     const room=await tempbook.find().populate('roomId').populate('userId') 
     return res.status(200).json({room})
    }
    catch(err){
      console.log(err);
      
        return res.status(500).json({message:"internal server error"})
    }
}