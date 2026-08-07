const districts=require('../Model/DistrictModel')
const states=require('../Model/StateModel')
const cities=require('../Model/CityModel')
const { default: mongoose } = require('mongoose');


exports.cityadd=async (req,res)=>{
    try{
       const {cityname,district_id}=req.body

     if(!(cityname && district_id)){
        return res.status(404).json({message:"all keys are required"})
     }

     const citydata=await cities.findOne({cityname})
     if(citydata){
        return res.status(409).json({message:"state already exist"})
     }

     const response=await cities.create({cityname,district_id})
     return res.status(201).json({message:"state created successfully"})
    }
    catch(err){
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.cityupdate=async (req,res)=>{
    try{
       const {_id,cityname,district_id}=req.body

     if(!(cityname && district_id)){
        return res.status(404).json({message:"all keys are required"})
     }
     const statedata=await cities.findById(_id)

     const response=await cities.findByIdAndUpdate(_id,{cityname,district_id})
     return res.status(200).json({message:"state updated successfully"})
    }
    catch(err){
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.cityreadall=async (req,res)=>{
    try{
        
 const {search,status,sort,districtsort,skip,limit}=req.query
 const searchVal = search || ""
 const cityPipeline = [];

// status 
 if (status) {
  cityPipeline.push({
    $match: {activestatus:status==="true" ? true : false}
  });
}

// Search by city name
if (searchVal) {
  cityPipeline.push({
    $match: {
      cityname: {
        $regex: searchVal,
        $options: "i"
      }
    }
  });
}


// Sort cities
if (sort) {
     if(sort==="az") cityPipeline.push({$sort: {cityname:1}})
         else if(sort==="za") cityPipeline.push({$sort: {cityname:-1}})
        else if(sort==='newest') cityPipeline.push({$sort: {createdAt:1}})
        else if(sort==='oldest') cityPipeline.push({$sort: {createdAt:-1}})
        }

const districtPipeline = [];

// Filter district
if (districtsort) {
  districtPipeline.push({
    $match: {
      _id: new mongoose.Types.ObjectId(districtsort),
      activestatus:true
    }
  });
}

districtPipeline.push({
  $lookup: {
    from: "cities",
    let: { districtId: "$_id" },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: ["$district_id", "$$districtId"]
          }
        }
      },
      ...cityPipeline
    ],
    as: "allcities"
  }
},
  {$match: {
      "allcities.0": { $exists: true }
    }});

const basePipeline = [
  {
    $match: { activestatus: true}
    },
  {
    $lookup: {
      from: "districts",
      localField: "_id",
      foreignField: "state_id",
      pipeline: districtPipeline,
      as: "alldistricts"
    }
  },
  {$match: {
      "alldistricts.0": { $exists: true }
    }}
];

const countResult = await states.aggregate([...basePipeline, { $count: "totalcount" }]);
const totalcount = countResult[0]?.totalcount || 0;

const pipeline = [...basePipeline];
if (skip) pipeline.push({ $skip: parseInt(skip) });
if (limit) pipeline.push({ $limit: parseInt(limit) });

const response = await states.aggregate(pipeline);

 return res.status(200).json({response, totalcount})
    }
    catch(err){
        console.log(err);
        
        return res.status(500).json({message:"internal server error"})
    }
}

exports.cityreadone=async (req,res)=>{
    try{
     const id=req.params.id   
     const response=await cities.findOne({_id:id}).populate("district_id")
     return res.status(200).json({response})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.citydelete = async (req,res)=>{
    try{
     const id=req.params.id  
     
     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await cities.findByIdAndDelete(id)
     return res.status(200).json({message : "deleted successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.citysoftdelete = async (req,res)=>{
    try{
     const id=req.params.id   

     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await cities.findByIdAndUpdate(id,{activestatus:false})
     return res.status(200).json({message : "temporary deleted"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.cityrecoverdelete = async (req,res)=>{
    try{
     const id=req.params.id  
     
     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await cities.findByIdAndUpdate(id,{activestatus:true})
     return res.status(200).json({message : "restored deleted"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}





