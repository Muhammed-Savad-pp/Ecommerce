const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userData',
        required:true,
    },

    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            Status:{
                type:String,
                enum: ['Confirmed', 'Shipped', 'Cancelled', 'Return','Delivered'],
                default:'Confirmed',
            },
            reason:{
                type:String,
            },
            price:{
                type:Number
            },
            categoryId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'category',
                required:true
            },
        },
    ],

    totalAmount:{
        type:Number,
        required:true,
    },
    
    address:[
        {
            name:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            state:{
                type:String,
                required:true
            },
            district:{
                type:String,
                required:true
            },
            country:{
                type:String,
                required:true
            },
            mobile:{
                type:Number,
                required:true
            },
            pincode:{
                type:Number,
                required:true
            },
        },
    ],

    paymentMethod:{
        type:String,
        required:true
    },

    paymentStatus:{
        type:String,
        enum:["Pending", "Success", "Failed"],
        default:"Pending",
    },

    orderId:{
        type:String,
        required:true
    },

    currendDate:{
        type:Date,
        default: ()=> Date.now(),
    },

    approvel:{
        type:Number,
        default:0
    },

    discount:{
        type:Number,
        default:0
    }

})

module.exports = mongoose.model('order',orderSchema);