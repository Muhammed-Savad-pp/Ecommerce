require('dotenv').config()

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)

const port = process.env.PORT  


const nocache = require('nocache')




const express = require('express')
const app = express();

app.use(nocache())


const flash = require('express-flash')

app.use(flash())



const path = require('path')

app.use(express.static('public'))







//  for user routes
const userRoute = require("./routes/userRouts");
app.use('/',userRoute)


//  for admin routes
const adminRoute = require('./routes/adminRouts')
app.use('/admin',adminRoute);

// google authenticaton 

const googleAuth = require('./googleAuth')

app.use('/',googleAuth)






app.listen(port,()=>{
    console.log('http://localhost:3000/admin/login');
    console.log('http://localhost:3000/');

})