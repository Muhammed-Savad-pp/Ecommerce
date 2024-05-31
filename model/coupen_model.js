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

    validity:{
        type:Date,
        required:true
    },
    
    is_active:{
        type:Boolean,
        default:0
    }

})

coupenSchema.index({validity:1},{expireAfterSeconds:0});
module.exports = mongoose.model('coupen',coupenSchema)