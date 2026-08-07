const reviews=require('../Model/ReviewModel')
const rooms=require('../Model/RoomModel')
const hotels=require('../Model/HotelModel')
const admins=require('../Model/AdminModel')
const user=require('../Model/UserModel')
const bookings=require('../Model/BookingModel')

exports.addreview= async (req,res)=>{
    try{
     const {bookId,userId,roomId,reviewtext,rating}=req.body

     if(!(bookId && userId && roomId && rating)){
        return res.status(400).json({message:"all data required"})
     }

        const existing=await bookings.findById(bookId)
         if(!existing){
             return res.status(404).json({message:"booking not found"})
         }

     const room=await rooms.findById(roomId)
     if(!room){
        return res.status(404).json({message:"room not found"})
     }
     
     const bookupdate=await bookings.findByIdAndUpdate(bookId,{bookingreview:true})
   

     const data={userId,hotelId:room?.hotel_id,reviewtext,rating}
     const response=await reviews.create(data)
     
     return res.status(201).json({message:"review successfull"})
    }
    catch(err){
        console.log(err);
        
      return res.status(500).json({message:"internal server error"})
    }
}

exports.hotelreviews= async (req,res)=>{
    try{
     const {hotelEmail}=req.params

     const hotel=await hotels.findOne({hotelEmail})
     if(!(hotel)){
        return res.status(400).json({message:"bad request"})
     }

     const result=await reviews.find({hotelId:hotel._id}) 
     return res.status(200).json({result})
    }
    catch(err){
        console.log(err);
        
      return res.status(500).json({message:"internal server error"})
    }
}

exports.adminhotelreviews= async (req,res)=>{
    try{
     const {owneremail}=req.params

     if(!(owneremail)){
        return res.status(400).json({message:"bad request"})
     }

     const admindata=await admins.findOne({owneremail}) 


     const result = await reviews.aggregate([
  {
    $lookup: {
      from: "hotels",
      localField: "hotelId",
      foreignField: "_id",
      as: "hotel"
    }
  },
  {
    $unwind: "$hotel"
  },
  {
    $match: {
      "hotel.admin_id": admindata._id
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  {
    $unwind: "$user"
  }
]);

     return res.status(200).json({result})
    }
    catch(err){
        console.log(err);
        
      return res.status(500).json({message:"internal server error"})
    }
}
