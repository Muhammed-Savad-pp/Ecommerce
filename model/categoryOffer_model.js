const mongoose = require('mongoose')

const CategoryOfferSchema = new mongoose.Schema({

    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
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
    }


})

CategoryOfferSchema.index({validity:1},{expireAfterSeconds:0});
module.exports = mongoose.model('categoryOffer',CategoryOfferSchema)