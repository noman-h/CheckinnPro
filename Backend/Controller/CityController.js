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
        const {search,status,sort,districtsort,skip,limit}=req.query;
        const searchVal = search || "";

        let matchQuery = {
            cityname: { $regex: searchVal, $options: "i" }
        };

        if (status !== undefined && status !== "") {
            matchQuery.activestatus = status === "true";
        }

        if (districtsort) {
            matchQuery.district_id = districtsort;
        }

        let sorting = null;
        if (sort === "az") sorting = { cityname: 1 };
        else if (sort === "za") sorting = { cityname: -1 };
        else if (sort === "newest") sorting = { createdAt: 1 };
        else if (sort === "oldest") sorting = { createdAt: -1 };

        const totalcount = await cities.countDocuments(matchQuery);

        let query = cities.find(matchQuery).populate({
            path: "district_id",
            populate: { path: "state_id" }
        });

        if (sorting) query = query.sort(sorting);
        if (skip) query = query.skip(parseInt(skip));
        if (limit) query = query.limit(parseInt(limit));

        const response = await query;

        return res.status(200).json({response, totalcount});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:"internal server error"});
    }
}

exports.cityreadone=async (req,res)=>{
    try{
     const id=req.params.id   
     const response=await cities.findOne({_id:id}).populate({
         path: "district_id",
         populate: { path: "state_id" }
     })
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





