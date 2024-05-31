const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({

    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userData',
        required:true
    },

    balance:{
        type:Number
    },

    history:[{

        amount:{
            type:Number
        },
        transactionType:{
            type:String
        },
        date:{
            type:Date,
            default:Date.now
        },
        previousBalance:{
            type:Number
        }

    }]

})

module.exports = mongoose.model('wallet',walletSchema)