const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const productScema = new mongoose.Schema({

    pname:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    image:{
        type:[String],
        required:true
    },
    is_delete:{
        type:Boolean,
        default:0
    },
    createdAt:{
        type:Date,
        dafault:Date.now()
    },
    offerprice:{
        type:Number,
        default:null
    },
    count:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('Product',productScema)