const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'userData',
        required:true
    },
    product:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            }
        }
    ]
    
})

module.exports = mongoose.model('cart',cartSchema)