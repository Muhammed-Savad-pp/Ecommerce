require('dotenv').config()

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)

const port = process.env.PORT  






const express = require('express')
const app = express();



const flash = require('express-flash')

app.use(flash())



const path = require('path')

app.use(express.static('public'))
// app.set('views', path.join(__dirname, 'view/admin'));






//  for user routes
const userRoute = require("./routes/userRouts");
app.use('/',userRoute)


//  for admin routes
const adminRoute = require('./routes/adminRouts')
app.use('/admin',adminRoute);

// google authenticaton 

const googleAuth = require('./googleAuth')

app.use('/',googleAuth)

        // facebook authentication

const facebookAuth = require('./facebookAuth')

app.use('/',facebookAuth)




app.listen(port,()=>{
    console.log('http://localhost:3000/admin/login');
    console.log('http://localhost:3000/home');

})