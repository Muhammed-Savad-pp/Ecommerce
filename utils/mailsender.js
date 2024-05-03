const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) =>{

    try {

          //Transfer to send email
     let transporter = nodemailer.createTransport({
        // host:process.env.MAIL_HOST,
        service:'gmail',
        auth:{
            user:process.env.MAIL_USER,
            pass:process.env.MAIL_PASS
        }
     })  
     
         // Configure email content 

    let info = await transporter.sendMail({
        from:'www.savad3517.me - Muhammed Savad pp',
        to:email,
        subject:title,
        html:body
    })

        
    } catch (error) {
        console.log(error.message)
    }


}

module.exports = mailSender;