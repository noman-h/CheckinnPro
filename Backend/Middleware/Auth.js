const jwt=require('jsonwebtoken')
const users=require('../Model/UserModel')

module.exports=async (req,res,next)=>{

    try{
     const authtoken=req.headers.authorization
   
    if(!authtoken){
        return res.status(401).json({message:"unauthorized request"})
    }
    
    
    const token=authtoken.split(" ")[1]
    
    const decode=jwt.verify(token,process.env.secretkey)
    
    if(!decode){
        return res.status(401).json({message:"invalid token"})
    }
    
    const userdetail=await users.findOne({email:decode.email})
       
    req.user=userdetail
    next()

    }
    catch(err){
       console.log(err);
       
   if (err.message === "jwt expired") {
      return res.status(401).json(err);
    }
   if (err.message === "jwt malformed") {
      return res.status(401).json(err);
    }
        
     return res.status(500).json({message:"internal server error",err})
    }
}