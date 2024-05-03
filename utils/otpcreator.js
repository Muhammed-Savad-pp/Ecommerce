const otpGenarator = require('otp-generator');
const OTP = require('../model/otp_model');


    //  otp creation section

const otp_gen_fun = async (req,res)=>{



   let otp = otpGenarator.generate(6, {
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false

    });

    let result = await OTP.findOne({otp:otp})

    while(result){

        otp = otpGenarator.generate(6, {
            upperCaseAlphabets:false
        })
        result = await OTP.find({otp:otp})
    }

    const email = req.body.email;

    const otpPayload = {email, otp}

    const otpBody = await OTP.create(otpPayload)

    

    return otpBody;



}

module.exports = otp_gen_fun;