const coupans=require('../Model/CoupanModel')
const hotels=require('../Model/HotelModel')
const rooms=require('../Model/RoomModel')
const admins=require('../Model/AdminModel')
const { default: mongoose } = require('mongoose');
const xlsx = require('xlsx');

exports.coupanadd=async (req,res)=>{
    try{
       const {hotel_id,coupancode,discount,startdate,enddate,maxprice}=req.body
      
     if(!(hotel_id && coupancode && discount && startdate && enddate && maxprice)){
        return res.status(404).json({message:"all keys are required"})
     }

     const coupandata=await coupans.findOne({coupancode})
     if(coupandata){
        return res.status(409).json({message:"coupancode already exist"})
     }

     const data=req.body
     const response=await coupans.create({...data})
     return res.status(201).json({message:"coupancode created successfully"})
    }
    catch(err){
        console.log(err);
        
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.coupanupdate=async (req,res)=>{
    try{
       const {_id,hotel_id,coupancode,discount,startdate,enddate,maxprice}=req.body

     if(!(hotel_id && coupancode && discount && startdate && enddate && maxprice)){
        return res.status(404).json({message:"all keys are required"})
     }

     const coupandata=await coupans.findById(_id)
     if(!coupandata) return res.status(404).json({message:"data not found related state"})

     const data=req.body   
     const response=await coupans.findByIdAndUpdate(_id,{...data})
     return res.status(200).json({message:"coupancode updated successfully"})
    }
    catch(err){
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.coupanreadall=async (req,res)=>{
    try{

     const {roomid}=req.params
     
     const room=await rooms.findById(roomid)
     if(!room){
        return res.status(404).json({message:"room not found"})
     }

     const response=await coupans.find({hotel_id:room.hotel_id}).populate('hotel_id')
     return res.status(200).json({response})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.coupanreadalladmin=async (req,res)=>{
    try{
     const {status,sort,hotelsort,skip,limit}=req.query
     const search = req.query.search || ""
     const {owneremail}=req.params
     
     const admin=await admins.findOne({owneremail})
     if(!admin){
        return res.status(404).json({message:"admin not found"})
     }

     let hotelfilter={}
     if(hotelsort){
               hotelfilter={"hoteldata._id":new mongoose.Types.ObjectId(hotelsort),
                       activestatus:true
                      }
     }

    let sortdata=null     
    if(sort==="az") sortdata={coupancode:1}
    else if(sort==="za") sortdata={coupancode:-1}
    else if(sort==="newest")  sortdata={startdate:-1}
    else if(sort==="oldest")  sortdata={startdate:1}

     const basePipeline=[
        {$lookup:{
        from:"hotels",
        localField:"hotel_id",
        foreignField:"_id",
        as:"hoteldata"
     }},
     {$unwind:"$hoteldata"},
     {$match:{
        "hoteldata.admin_id":admin._id,
        activestatus:(status==="active") ? true : false,
        $or:[
            {coupancode:{$regex:search ,$options:"i"}},
            {"hoteldata.hotelName":{$regex:search ,$options:"i"}}
        ],
        ...hotelfilter
     }}
    ]

     const countresult=await coupans.aggregate([...basePipeline,{$count:'totalcount'}])
     const totalcount=countresult[0]?.totalcount || 0;

     const pipeline=[...basePipeline]
     if(sortdata) pipeline.push({$sort:sortdata})
     if(skip) pipeline.push({$skip:parseInt(skip)})
     if(limit) pipeline.push({$limit:parseInt(limit)})

     const response=await coupans.aggregate(pipeline)
     return res.status(200).json({response,totalcount})
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:"internal server error"})
    }
}

exports.coupanreadallhotel=async (req,res)=>{
    try{
     const {hotelemail}=req.params

     const hotel=await hotels.findOne({hotelEmail:hotelemail})
     if(!hotel){
        return res.status(404).json({message : "not found hotel"})
     }

     const response=await coupans.find({hotel_id:hotel._id}).populate('hotel_id')
     return res.status(200).json({response})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.coupanreadone=async (req,res)=>{
    try{
     const id=req.params.id   
     const response=await coupans.findOne({_id:id}).populate('hotel_id')
     return res.status(200).json({response})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.coupandelete = async (req,res)=>{
    try{
     const id=req.params.id  
     
     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await coupans.findByIdAndDelete(id)
     return res.status(200).json({message : "deleted successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.coupansoftdelete = async (req,res)=>{
    try{
     const id=req.params.id   

     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await coupans.findByIdAndUpdate(id,{activestatus:false})
     return res.status(200).json({message : "temporary deleted"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.coupanrecoverdelete = async (req,res)=>{
    try{
     const id=req.params.id  
     
     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await coupans.findByIdAndUpdate(id,{activestatus:true})
     return res.status(200).json({message : "restored deleted"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.coupanbulkimport = async (req, res) => {
    try {
        const { hotel_id } = req.body;
        if (!hotel_id) {
            return res.status(400).json({ message: "hotel_id is required" });
        }

        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.files.file;
        const workbook = xlsx.read(file.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        if (!jsonData || jsonData.length === 0) {
            return res.status(400).json({ message: "File is empty or invalid format" });
        }

        const validCoupons = [];
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const { coupancode, discount, startdate, enddate, maxprice } = row;

            if (!coupancode || !discount || !startdate || !enddate || !maxprice) {
                errors.push(`Row ${i + 2}: Missing required fields`);
                continue;
            }

            // check if coupon already exists
            const existing = await coupans.findOne({ coupancode });
            if (existing) {
                errors.push(`Row ${i + 2}: Coupon ${coupancode} already exists`);
                continue;
            }

            // process dates if they are excel serial numbers
            let sDate = startdate;
            let eDate = enddate;
            
            // basic excel date to js date conversion if it's a number
            if(typeof sDate === 'number') {
                sDate = new Date(Math.round((sDate - 25569) * 86400 * 1000));
            } else {
                sDate = new Date(sDate);
            }
            if(typeof eDate === 'number') {
                eDate = new Date(Math.round((eDate - 25569) * 86400 * 1000));
            } else {
                eDate = new Date(eDate);
            }

            validCoupons.push({
                hotel_id,
                coupancode: String(coupancode),
                discount: Number(discount),
                startdate: sDate,
                enddate: eDate,
                maxprice: Number(maxprice)
            });
        }

        if (validCoupons.length > 0) {
            await coupans.insertMany(validCoupons);
        }

        return res.status(200).json({
            message: "Bulk import completed",
            imported: validCoupons.length,
            errors: errors
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
