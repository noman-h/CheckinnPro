const users=require('../Model/UserModel')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const moment=require('moment')



 const htmltemplate=require('../Utils/HtmlTemplate')
        const sendmail=require('../Utils/Helper')

exports.singup= async (req,res)=>{
    
    try{
    const {name,email,phone,password,role}=req.body

    if(!(name && email && password)){
        return res.status(404).json({message : "all detail is required"})
    }

    const existinguser=await users.findOne({email})
    if(existinguser){
        return res.status(409).json({message:"email already exist"})
    }

    const saltrounds=10;
    const salt=bcrypt.genSaltSync(saltrounds)
    const hashpass=bcrypt.hashSync(password,salt)
    
    const response=await users.create({name,email,phone,password:hashpass,role})
    await sendmail.mailsend(email,"account created",htmltemplate.accountCreatedTemplate(name))
    return res.status(201).json({message:"singup successfull"})
    }
    catch(err){
        console.log(err)
        
        return res.status(500).json({message:"internal server error",err})
    }
}

exports.login=async (req,res)=>{
    try{
        const {email,password}=req.body

        if(!(email && password)){
            return res.status(404).json({message:"all keys are required"})
        }

        const user=await users.findOne({email})

        if(!user) {
            return res.status(404).json({message:"user not found"})
        }

        const match=bcrypt.compareSync(password,user.password)

        if(!match){
            return res.status(401).json({message:"wrong password"})
        }

        const token=jwt.sign({email},process.env.secretkey,{expiresIn:"7d"})

        return res.status(200).json({message:"login success",token,user})

    }
    catch(err){
        console.log(err);
        
        return res.status(500).json({message:"internal server error",err})
    }
}

exports.resetpass=async (req,res)=>{
     try {
    const { email, password, confirmpassword } = req.body;

    const result = await users.findOne({ email });
    if (!result) {
      return res.status(404).json({ message: "email not found" });
    } else {
      const match = bcrypt.compareSync(password, result.password);
      if (match) {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(confirmpassword, salt);

        const updated = await users.findOneAndUpdate(
          { email },
          { password: hash },
        );

        return res.status(200).json({ message: "reset successfully" });
      } else {
        return res.status(401).json({ message: "login failed" });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
}


exports.forgetotpsend=async (req,res)=>{
    try{
        const {email}=req.body
        console.log(email);
        
        if(!(email)){
            return res.status(404).json({message:"all keys are required"})
        }

        const user=await users.findOne({email})

        if(!user) {
            return res.status(404).json({message:"user not found"})
        }
       
        const otpgen=require('../Utils/otpgen')
        const otp=otpgen()
        const saveotp=await users.findOneAndUpdate({email},{
            otp:otp,
            expiretime:moment().add(10, 'minutes')
        })

        
        const mailid=await sendmail.mailsend(email,'otp for password forget',htmltemplate.otptemplate(user.name,otp))
        
        if(mailid){
            return res.status(200).json({message:"mail send successfully"})
        }
        else{
            return res.status(400).json({message:"mail send failed"})
        }

    }
    catch(err){
      console.log(err);
      
        return res.status(500).json({message:"internal server error"})
    }
}

exports.forgetotpverify=async(req,res)=>{
    try{
       const {email,otp}=req.body

    if(!(email && otp)){
            return res.status(404).json({message:"all keys are required"})
        }

        const user=await users.findOne({email})

        if(!user) {
            return res.status(404).json({message:"user not found"})
        }

       if(Number(otp) === user.otp && moment().isSameOrBefore(user.expiretime)){
         return res.status(200).json({ message: "Code verify" });
       }
       else if (user.otp !== Number(otp)) {
        return res.status(401).json({ message: "wrong code" });
      }
       else {
        await user.findOneAndUpdate({ email }, { otp: "", expiretime: "" });
        return res.status(403).json({ message: "Code expire" });
      }
    }
    catch(err){
    return res.status(500).json({message:"internal server error"})
    } 
}

exports.forgetpass = async (req, res) => {
  try {
    const { otp, email, confirmpassword } = req.body;
    const result = await users.findOne({ email });
    if (!result) {
      return res.status(404).json({ message: "email not found" });
    } else {
      if (result.otp === Number(otp)) {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(confirmpassword, salt);

        const updated = await users.findOneAndUpdate(
          { email },
          { password: hash, otp: "", expiretime: "" },
        );
        return res.status(200).json({ message: "changed successfully" });
      } else if (result.otp !== Number(otp)) {
        return res.status(401).json({ message: "wrong code" });
      }
    }
  } catch (err) {
    console.log(err);
    
    return res.status(500).json({ message: "internal server error" });
  }
};


exports.changetheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const { email } = req.user;
    const result = await users.findOne({ email });
    if (!result) {
      return res.status(404).json({ message: "user not found" });
    } else {
      const updated = await users.findOneAndUpdate({ email }, { status: theme });

      return res.status(200).json({ message: "changed successfully", updated });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};