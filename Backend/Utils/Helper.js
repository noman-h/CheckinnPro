const nodemailer=require('nodemailer')

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user : process.env.mailuser,
        pass : process.env.mailpass
    }
})

exports.mailsend= async (sendermail,sendersubject,senderhtml)=>{
    try{

        // const info=await transporter.sendMail({
        //     from:process.env.mailuser,
        //     to:sendermail,
        //     subject:sendersubject,
        //     html:senderhtml
        // }) 

        // return info.messageId
        return "fghfgdfsvfbgfdbv"
    }
    catch(err){
         console.log(err)
    }
}