const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    is_admin:{
        type:Boolean,
        default:false
    },
    is_blocked:{
        type:Boolean,
        default:true
    }



}) 

module.exports = mongoose.model("userData",userSchema)