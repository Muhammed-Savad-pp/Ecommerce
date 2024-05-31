const mongoose =require('mongoose');
const mailsender = require('../utils/mailsender')

const otpschema = new mongoose.Schema({
    
    email:{
        type:String,
        required:true
    },

    otp:{
        type:String,
        required:true
    },

    createdAt:{
        type:Date,
        default:Date.now,
        expires:60*1
    }
})

async function sendverification(email,otp) {
    

    try {

            const mailResponse = await mailsender(
                
                email,
               
                'Verfication Email',
                `<h1>Please confirm your password</h1>
                 <P>Here is your OTP code : </p>
                 <h2 style ="color:red;">OTP : ${otp}</h2>
                 <P> Do not share the otp anywhere</p>`

            )
            
            
            console.log('Email send Sucessfuly  :',mailResponse);
        
    } catch (error) {
        console.log('Error Occured while sending email :>',error);
        throw error
    }

}

otpschema.pre('save',async function(next){

        
    if (this.isNew) {
        try {
            await sendverification(this.email, this.otp);
        } catch (error) {
            next(error);
        }
    }
    next();

})

module.exports = mongoose.model('OTP',otpschema)