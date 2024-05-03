const mongoose = require('mongoose');

const coupenSchema = new mongoose.Schema({

    coupenCode:{
        type:String,
        required:true
    },

    discription:{
        type:String,
        required:true
    },
    
    minPrice:{
        type:Number,
        required:true
    },

    discount:{
        type:Number,
        required:true
    },

    StartDate:{
        type:Date,
        default:()=>Date.now()
    },

    expiryDate: {
        type: Date,
        default: () => {
            // Calculate expiry date as 3 days from now
            const currentDate = new Date();
            const expiryDate = new Date(currentDate);
            expiryDate.setDate(currentDate.getDate() + 4); // Add 3 days
            return expiryDate;
        }
    }

})

module.exports = mongoose.model('coupen',coupenSchema)