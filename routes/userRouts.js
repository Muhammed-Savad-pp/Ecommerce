const express = require('express');
const user_route = express();

const session = require('express-session');
const config = require('../config/userConfig');
user_route.use(session({
        secret:config.sessionSecret,
        resave: false,
        saveUninitialized: true,
}))



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
user_route.post('/resendOtp',userController.resendOtp)

user_route.get('/userlogout',auth.isLogin,userprofileController.userlogout)


                // forgot Password

user_route.get('/forgotPassord',userController.ForgotPasswordload)

user_route.post('/checkMail',userController.CheckUserEmail)

user_route.get('/forgotPasswordOtp',userController.LoadForgotPassordOtpPage);

user_route.post('/checkOtp',userController.checkOtpForgotPassword);

user_route.get('/newPasswordPage',userController.LoadNewPasswordPage);

user_route.post('/changePassword',userController.changeUserPassword)

        // home
user_route.get('/home',nocache(),userController.loadHome)


        // shop
user_route.get('/shop',shopController.loadShop)

user_route.get('/singleproduct',shopController.singleproduct)

            // cart

user_route.get('/cart',auth.isLogin,auth.checkStatus,cartController.cartLoad)

user_route.post('/addcart',auth.isLogin,cartController.addcart)

user_route.post('/update-quantity',auth.isLogin,cartController.updateQuantity)

user_route.post('/deletecartproduct',auth.isLogin,cartController.deleteproductfromcart)

//          checout page

user_route.get('/checkout',auth.isLogin,auth.checkStatus,cartController.loadcheckoutpage)

user_route.post('/checkProductStock',auth.isLogin,cartController.checkQuantityInStock)

user_route.post('/addAddressFromCheckout',auth.isLogin,cartController.AddAddressFromCheckout)

user_route.get('/checkoutEditAddress',auth.isLogin,auth.checkStatus,cartController.loadChecoutEditAddress)

user_route.post('/editAddressFromCheckout',auth.isLogin,cartController.updateAddressFromCheckout)

user_route.get('/order',auth.isLogin,auth.checkStatus,cartController.loadOrder)

user_route.post('/orderproduct',auth.isLogin,cartController.orderProducts)

user_route.post('/razor',auth.isLogin,cartController.razorpayment)

user_route.post("/walletOrder",auth.isLogin,cartController.WalletOrderPayment)

                // coupen 

user_route.post('/checkCoupen',auth.isLogin,cartController.checkCoupen);

user_route.post('/removeCoupen',auth.isLogin,cartController.removeCoupen)


        //  userprofile
user_route.get('/userprofile',auth.isLogin,auth.checkStatus,userprofileController.LoadUserProfile)

user_route.post('/editUserprofile',auth.isLogin,userprofileController.updateUserProfile)

user_route.post('/edituserpassword',auth.isLogin,userprofileController.updateUserPassword)

user_route.get('/userAddress',auth.isLogin,auth.checkStatus,userprofileController.loadAddress)

user_route.get('/addAddress',auth.isLogin,auth.checkStatus,auth.isLogin,userprofileController.addAddressLoad)

user_route.post('/addaddress',auth.isLogin,userprofileController.addadress)

user_route.get('/delecteaddress',auth.isLogin,userprofileController.deleteAddress)

user_route.get('/editaddress',auth.isLogin,auth.checkStatus,userprofileController.editaddressload)

user_route.post('/updateaddress',auth.isLogin,userprofileController.updateaddress)

          
        // user order details

user_route.get('/orderDetails',auth.isLogin,auth.checkStatus,userOrderController.LoadOrderDatails)

user_route.get('/singleOrderDetails',auth.isLogin,auth.checkStatus,userOrderController.LoadSingleOrderDeatails)

user_route.post('/cancelOrder',auth.isLogin,userOrderController.cancelorder);

user_route.post('/returnOrder',auth.isLogin,userOrderController.returnOrder);

user_route.post('/continuePayment',auth.isLogin,userOrderController.ChangeUserOrderPaymentStatus)


            // wishilist

user_route.get('/wishilist',auth.isLogin,auth.checkStatus,userController.loadWishilist);

user_route.post('/addProdcutToWishilist',auth.isLogin,userController.addProdcutToWishilist);

user_route.post('/deletProduct',auth.isLogin,userController.deleteProductFromWishilist)

user_route.post('/addToCartFromWishilist',auth.isLogin,userController.addToCartFromWishilist)


        // wallet 

user_route.get('/wallet',auth.isLogin,auth.checkStatus,userprofileController.LoadWallet);

user_route.get('/addMoney',auth.isLogin,auth.checkStatus,userprofileController.LoadAddMoney);

user_route.post('/walletRazor',auth.isLogin,userprofileController.addMoneyInWalletUsingRazorpay);

user_route.post('/addwalletMoney',auth.isLogin,userprofileController.addmoney);

user_route.get('/WalletWithDraw',auth.isLogin,auth.checkStatus,userprofileController.loadWithdrawMoneyinWallet);

user_route.post('/withdrawMoney',auth.isLogin,userprofileController.withdrawMoneyFromWallet);

user_route.get('/walletTransacton',auth.isLogin,auth.checkStatus,userprofileController.LoadWalletTransaction)


module.exports = user_route