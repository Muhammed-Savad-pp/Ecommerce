const mongoose = require('mongoose');

const wishilistSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userData',
        required:true
    },

    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            }
        }
    ]

})

module.exports = mongoose.model('wishilist',wishilistSchema)