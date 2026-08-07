const states=require('../Model/StateModel')

exports.stateadd=async (req,res)=>{
    try{
       const {statename}=req.body
      
     if(!statename){
        return res.status(404).json({message:"all keys are required"})
     }

     const statedata=await states.findOne({statename})
     if(statedata){
        return res.status(409).json({message:"state already exist"})
     }

     const response=await states.create({statename})
     return res.status(201).json({message:"state created successfully"})
    }
    catch(err){
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.stateupdate=async (req,res)=>{
    try{
       const {_id,statename}=req.body

     if(!statename){
        return res.status(404).json({message:"all keys are required"})
     }
     const statedata=await states.findById(_id)
     if(!statedata) return res.status(404).json({message:"data not found related state"})

     const response=await states.findByIdAndUpdate(_id,{statename})
     return res.status(200).json({message:"state updated successfully"})
    }
    catch(err){
       return res.status(500).json({message:"internal server error",err})
    }
}

exports.statereadall=async (req,res)=>{
    try{
         const {search,status,sort,skip,limit}=req.query;
         const searchVal = search || "";

         let sorting=null;
        if(sort==="az") sorting={statename:1}
          else if(sort==="za") sorting={statename:-1}
         else if(sort==='newest') sorting={createdAt:1}
         else if(sort==='oldest') sorting={createdAt:-1} 
        
         let matchQuery = {
             statename: { $regex: searchVal, $options: "i" }
         };
         if (status !== undefined) {
             matchQuery.activestatus = status === "true";
         }
      
      const totalcount = await states.countDocuments(matchQuery);

      let query = states.find(matchQuery).sort(sorting);
      if (skip) query = query.skip(parseInt(skip));
      if (limit) query = query.limit(parseInt(limit));

      const response = await query;
      return res.status(200).json({response, totalcount})
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:"internal server error"})
    }
}

exports.statereadone=async (req,res)=>{
    try{
     const id=req.params.id   
     const response=await states.findOne({_id:id})
     return res.status(200).json({response})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.statedelete = async (req,res)=>{
    try{
     const id=req.params.id  
     
     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await states.findByIdAndDelete(id)
     return res.status(200).json({message : "deleted successfully"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.statesoftdelete = async (req,res)=>{
    try{
     const id=req.params.id   

     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await states.findByIdAndUpdate(id,{activestatus:false})
     return res.status(200).json({message : "temporary deleted"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}

exports.staterecoverdelete = async (req,res)=>{
    try{
     const id=req.params.id  
     
     if(!id){
        return res.status(404).json({message : "id not found"})
     }

     const response=await states.findByIdAndUpdate(id,{activestatus:true})
     return res.status(200).json({message : "restored deleted"})
    }
    catch(err){
        return res.status(500).json({message:"internal server error"})
    }
}





