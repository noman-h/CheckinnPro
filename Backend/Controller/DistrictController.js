const states=require('../Model/StateModel')
const districts=require('../Model/DistrictModel');
const { default: mongoose } = require('mongoose');


exports.districtadd=async (req,res)=>{
    try{
       const {districtname,state_id}=req.body
      
       
     if(!(districtname && state_id)){
        console.log(req.body);
        
        return res.status(404).json({message:"all keys are required"})
     }

     const districtdata=await districts.findOne({districtname})
     if(districtdata){
        return res.status(409).json({message:"district already exist"})
     }

     const response=await districts.create({districtname,state_id})
     return res.status(201).json({message:"district created successfully"})
    }
    catch(err){
        console.log(err);
        
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.districtupdate=async (req,res)=>{
    try{
       const {_id,districtname,state_id}=req.body

     if(!(districtname && state_id)){
        return res.status(404).json({message:"all keys are required"})
     }
     const statedata=await districts.findById(_id)

     const response=await districts.findByIdAndUpdate(_id,{districtname,state_id})
     return res.status(200).json({message:"state updated successfully"})
    }
    catch(err){
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.districtreadall=async (req,res)=>{  
    try{
    const {search,sort,status,statesort}=req.query
    
    let statefilter={}
    if(statesort){
       statefilter={_id:new mongoose.Types.ObjectId(statesort),
        activestatus:true
       }
    }

    let sorting=null;
       if(sort==="az") sorting={districtname:1}
         else if(sort==="za") sorting={districtname:-1}
        else if(sort==='newest') sorting={createdAt:1}
        else if(sort==='oldest') sorting={createdAt:-1}

const response = await states.aggregate([
  {
    $match: statefilter
  },
  {
    $lookup: {
      from: "districts",
      let: { stateId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$state_id", "$$stateId"]
            },
            districtname: {
              $regex: search,
              $options: "i"
            },
            activestatus: (status==="true" ? true : false)
          }
        },
        ...(sorting) ? [{$sort:sorting}] : []
      ],
      as: "alldistricts"
    }
  },
  {
    $match: {
      "alldistricts.0": { $exists: true }
    }
  }
]);
    
     return res.status(200).json({response})
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:"internal server error"})
    }
}

exports.districtreadone=async (req,res)=>{
    try{
     const id=req.params.id   
     const response=await districts.findOne({_id:id}).populate("state_id")
     return res.status(200).json({response})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.districtdelete = async (req,res)=>{
    try{
     const id=req.params.id  
     
     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await districts.findByIdAndDelete(id)
     return res.status(200).json({message : "deleted successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.districtsoftdelete = async (req,res)=>{
    try{
     const id=req.params.id   

     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await districts.findByIdAndUpdate(id,{activestatus:false})
     return res.status(200).json({message : "temporary deleted"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.districtrecoverdelete = async (req,res)=>{
    try{
     const id=req.params.id  
     
     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await districts.findByIdAndUpdate(id,{activestatus:true})
     return res.status(200).json({message : "restored deleted"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}





