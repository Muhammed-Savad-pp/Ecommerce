const express = require('express');
const user_route = express();

const session = require('express-session');
const config = require('../config/userConfig');
user_route.use(session({secret:config.sessionSecret}))

user_route.set('view engine','ejs');
user_route.set('views','./views/user');

const bodyparser = require('body-parser');
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}))

const nocache = require('nocache')

    // user controller
const userController = require('../controller/userController');

    // shop controller
const shopController = require('../controller/shopController');

    // cart controller
const cartController = require('../controller/cartCantroller')

    // userprofile controller
const userprofileController = require('../controller/userprofileController');

    // userOrderController
const userOrderController = require('../controller/userOrderController')

const auth = require('../middelware/auth')


        // user login and registration logout
user_route.get('/login',nocache(),auth.isLogout,userController.loadlogin)
user_route.post('/login',userController.isLogin)

user_route.get('/register',userController.loadregister)
user_route.post('/register',userController.otpCreation)
user_route.post('/verify_otp',userController.OTPverification)

user_route.get('/userlogout',auth.isLogin,userprofileController.userlogout)

        // home
user_route.get('/home',nocache(),userController.loadHome)


        // shop
user_route.get('/shop',shopController.loadShop)

user_route.get('/singleproduct',shopController.singleproduct)

            // cart

user_route.get('/cart',cartController.cartLoad)

user_route.post('/addcart',cartController.addcart)

user_route.post('/update-quantity',cartController.updateQuantity)

user_route.post('/deletecartproduct',cartController.deleteproductfromcart)

//          checout page

user_route.get('/checkout',cartController.loadcheckoutpage)

user_route.post('/checkProductStock',cartController.checkQuantityInStock)

user_route.post('/addAddressFromCheckout',cartController.AddAddressFromCheckout)

user_route.get('/checkoutEditAddress',cartController.loadChecoutEditAddress)

user_route.post('/editAddressFromCheckout',cartController.updateAddressFromCheckout)

user_route.get('/order',cartController.loadOrder)

user_route.post('/orderproduct',cartController.orderProducts)


        //  userprofile
user_route.get('/userprofile',auth.isLogin,userprofileController.LoadUserProfile)

user_route.post('/editUserprofile',userprofileController.updateUserProfile)

user_route.post('/edituserpassword',userprofileController.updateUserPassword)

user_route.get('/userAddress',auth.isLogin,userprofileController.loadAddress)

user_route.get('/addAddress',auth.isLogin,auth.isLogin,userprofileController.addAddressLoad)

user_route.post('/addaddress',userprofileController.addadress)

user_route.get('/delecteaddress',userprofileController.deleteAddress)

user_route.get('/editaddress',userprofileController.editaddressload)

user_route.post('/updateaddress',userprofileController.updateaddress)

        // user order details

user_route.get('/orderDetails',auth.isLogin,userOrderController.LoadOrderDatails)

user_route.get('/singleOrderDetails',auth.isLogin,userOrderController.LoadSingleOrderDeatails)

user_route.post('/cancelOrder',userOrderController.cancelorder);

user_route.post('/returnOrder',userOrderController.returnOrder)


            // wishilist

user_route.get('/wishilist',auth.isLogin,userController.loadWishilist);

user_route.post('/addProdcutToWishilist',userController.addProdcutToWishilist);

user_route.post('/deletProduct',userController.deleteProductFromWishilist)

user_route.post('/addToCartFromWishilist',userController.addToCartFromWishilist)


module.exports = user_route