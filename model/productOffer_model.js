const mongoose = require('mongoose')

const ProductOfferSchema = new mongoose.Schema({

    ProductId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },

    offer:{
        type:Number,
        required:true
    },

    validity:{
        type:Date,
        required:true
    },

    activation:{
        type:Boolean,
        default:1
    },

  


})

ProductOfferSchema.index({validity:1},{expireAfterSeconds:0});
module.exports = mongoose.model('productOffer',ProductOfferSchema)