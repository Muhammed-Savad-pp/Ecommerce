const { tryEach } = require("async");
const User = require("../model/user_model");
const bcrypt = require('bcrypt');
const otpGenarator = require('otp-generator');
const OTP = require('../model/otp_model');
const otp_gen_fun = require('../utils/otpcreator')
const category = require('../model/category_model')
const product = require('../model/product_model')
const Wishilist = require('../model/wishilist_modal')
const Cart = require('../model/cart_model')

const securePassword = async (password)=>{
    try{
    
        const passwordHash = await bcrypt.hash(password,10)
         return passwordHash
    }

    catch (error){
        console.log(error.message);
    }

}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

const loadHome = async(req,res)=>{

    try {
        const userid = req.session.user_id

        const products = await product.find({is_delete:false})

        const Carts = await  Cart.findOne({userId:userid}).populate('product.productId')

        const cartsdata = Carts ? Carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        

        res.render('home',{user:userid,products, cartsdata: cartsdata, wishilistData})

    } catch (error) {
        console.log(error.message)
    }

}

const loadlogin = async(req,res)=>{

    try {

        const userid = req.session.user_id
        const Carts = await  Cart.findOne({userId:userid}).populate('product.productId')

        const cartsdata = Carts ? Carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        
        res.render('login',{cartsdata,wishilistData})

    } catch (error) {
        console.log(error.message);
    }

}

const loadregister = async(req,res)=>{

    try {
        
        const userid = req.session.user_id
        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const {referal_code} = req.query;
    
        req.session.referal_code = referal_code;
   

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];
       
        res.render('userReg',{cartsdata, wishilistData})


    } catch (error) {
        console.log(error.message);
    }

}

const otpCreation = async (req,res)=>{

    
    const userid = req.session.user_id
    const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
    const cartsdata = carts ? carts.product : [];

    const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
    const wishilistData = wishilist ? wishilist.items : [];
    const refered = req.session.referal_code
    
    
        const {name,email,mno,password,conformPassword }=req.body;

        const spassword = await securePassword(password);
        const exits = await User.findOne({email:email});

        if(exits){
            res.render('userReg', {message: 'Emal Already Excits',cartsdata, wishilistData})
            return false


        }
        else if (password == conformPassword){

            try {
                

                const user = User({
                            email:email,
                            name:name,
                            password:spassword,
                            mobile:mno,
                            referlCode:generateRandomString(6),
                            refered:refered
           
                 });
           
                 const userData = await user.save();
                        
                       

                const otpBody = await otp_gen_fun (req,res);

                res.render('otp',{email:email,cartsdata:cartsdata,wishilistData})

                 console.log('Genorated OTP : ',otpBody);



                
            } catch (error) {

                console.log(error.message);
                
            }   


        }else{
            res.render('userReg',{message:'Password Mismatch',cartsdata, wishilistData})
        }

}    

        // OTP verification after OTP  send to email



const OTPverification = async(req,res)=>{
    

    try {

        const userid = req.session.user_id
        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];
        
        const otp = req.body.otp;
        const email = req.body.email;
        
      

        const response = await OTP.find({otp}).sort({createdAt: -1}).limit(1);
        

        if(response.length === 0 || otp !== response[0].otp){
           
            
            res.json({success:false})
            

        }else{
           
            const email = req.body.email
            await User.updateOne({email:email},{$set:{is_blocked:false}})
           

            res.json({success:true})

        }

        


    } catch (error) {
        console.log(error.message);
    }


}

const resendOtp = async(req,res)=>{

    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const otpBody = await otp_gen_fun(req, res);
        console.log('Generated OTP:', otpBody);

        res.json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }


}


       // user login
       
const isLogin = async (req,res)=>{

    try {

        
        const userid = req.session.user_id
        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        const email = req.body.email;
        const password =req.body.password;

        const userData = await User.findOne({email:email})

        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password)

            if(passwordMatch){

                    if(userData.is_blocked === false){

                        req.session.user_id = userData._id;
                        res.redirect('/')
                    
                    }else{
                        res.render('login',{message:'Admin blocked you',cartsdata,wishilistData})
                    }

            }
            else{
                res.render('login',{message:'Email and Password is incorrect',wishilistData,cartsdata })
            }


        }
        else{
            res.render('login',{message:'Email and Password is incorrect',cartsdata, wishilistData})
        }


    } catch (error) {
        console.log(error.message)
    }

}

const loadWishilist = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

       
        

        res.render('wishilist',{wishilistData:wishilistData,cartsdata})

    } catch (error) {
        console.log(error.message);
    }


}

const addProdcutToWishilist = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const productid = req.body.productid;

        if(!userid){
            return res.json({success:false,errors:['Please Login']})
        }

        const wishilist = await Wishilist.findOne({userId:userid})

        if(wishilist){

            const existsProduct = await Wishilist.findOne({userId:userid,'items.productId':productid});

            if(existsProduct){
                return res.json({success:false,errors:['Product Already Added']})
            }else{

              
                wishilist.items.push({productId:productid})
                await wishilist.save();
                return res.json({success:true})
            }
        }else{

            const wishilistData = new Wishilist({
                userId:userid,
                items:[{productId:productid}]
            })

            await wishilistData.save()
            return res.json({success:true})
        }
        
    } catch (error) {
        console.log(error.message);
    }

}
    
const deleteProductFromWishilist = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const productid = req.body.productId;

        const deleteData = await Wishilist.findOneAndUpdate({userId:userid,'items.productId':productid},{$pull:{items:{productId:productid}}});
        if(deleteData){
            res.json({success:true})
        }

    } catch (error) {
        console.log(error.message);
    }


}

const addToCartFromWishilist = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const productid = req.body.productid;

        const cart = await Cart.findOne({userId:userid});

        if(cart){

            const existsProduct = await Cart.findOne({userId:userid,'product.productId':productid})

            if(existsProduct){
                return res.json({success:false, message:'Product already added in cart'})
            }else{

                cart.product.push({productId:productid})
                await cart.save();
                await Wishilist.findOneAndUpdate({userId:userid,'items.productId':productid},{$pull:{items:{productId:productid}}})
                return res.json({success:true})
            }
        }else{
            const cartData = new Cart({
                userId:userid,
                product:[{productId:productid}]
            })
            await cartData.save()
            await Wishilist.findOneAndUpdate({userId:userid,'items.productId':productid},{$pull:{items:{productId:productid}}})
            return res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }

}

const ForgotPasswordload = async(req,res)=>{

    try {

        res.render('fPEEPage')
        
    } catch (error) {
        console.log(error.message);
    }


}

const CheckUserEmail = async(req,res)=>{

    const email = req.body.email
    
    const excits = await User.findOne({email:email})

    if(excits){

        const otpBody = await otp_gen_fun (req,res);
        console.log('forgot OTP : ',otpBody);

        res.json({success:true})


    }else{
        res.json({success:false})
    }

}

const LoadForgotPassordOtpPage = async(req,res)=>{

    try {
        const email = req.query.email;

        
        res.render('forgotPasswordOtp',{email})
    } catch (error) {
        console.log(error.message);
    }

}

const checkOtpForgotPassword = async(req,res)=>{

    try {
        
        const otp = req.body.otp;
        const email = req.body.email;

        
        const response = await OTP.find({otp}).sort({createdAt: -1}).limit(1);
        

        if(response.length === 0 || otp !== response[0].otp){
           
            
            res.json({success:false})
            

        }else{

            res.json({success:true})

        }


    } catch (error) {
        console.log(error.message);
    }

}


const LoadNewPasswordPage = async(req,res)=>{

    try {

        const email = req.query.email;
        res.render('passwordenterpage',{email})
        
    } catch (error) {
        console.log(error.message);
    }

}

const changeUserPassword = async(req,res)=>{

    try {
        
        const password = req.body.password;
        const email = req.body.email;
        const Cpassword = req.body.Cpassword;
        
        if(password != Cpassword){
            res.json({success:false})
        }else{

            const spassword = await securePassword(password);

            const userData = await User.findOneAndUpdate({email:email},{$set:{password:spassword}})

            if(userData){
                res.json({success:true})
            }


        }

    } catch (error) {
        console.log(error.message);
    }

}





module.exports={
    loadHome,
    loadregister,
    loadlogin,
    otpCreation,
    OTPverification,
    isLogin,
    loadWishilist,
    addProdcutToWishilist,
    deleteProductFromWishilist,
    addToCartFromWishilist,
    resendOtp,
    ForgotPasswordload,
    CheckUserEmail,
    LoadForgotPassordOtpPage,
    checkOtpForgotPassword,
    LoadNewPasswordPage,
    changeUserPassword
    
    
}