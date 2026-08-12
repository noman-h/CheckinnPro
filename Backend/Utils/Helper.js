const nodemailer=require('nodemailer')

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.mailuser,
        pass: process.env.mailkey
    }
});

exports.mailsend= async (sendermail,sendersubject,senderhtml)=>{
    try{

        const info=await transporter.sendMail({
            from:process.env.mailemail,
            to:sendermail,
            subject:sendersubject,
            html:senderhtml
        }) 

        console.log("Email sent:", info.messageId);
        return info.messageId
    }
    catch(err){
         console.log(err)
    }
}