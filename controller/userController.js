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

const loadHome = async(req,res)=>{

    try {
        const userid = req.session.user_id
        //console.log('userid',userid);
        res.render('home',{user:userid})

    } catch (error) {
        console.log(error.message)
    }

}

const loadlogin = async(req,res)=>{

    try {
        
        res.render('login')

    } catch (error) {
        console.log(error.message);
    }

}

const loadregister = async(req,res)=>{

    try {
        
        res.render('userReg')


    } catch (error) {
        console.log(error.message);
    }

}

const otpCreation = async (req,res)=>{

    
        
        const {name,email,mno,password,conformPassword }=req.body;

        const spassword = await securePassword(password);
        const exits = await User.findOne({email:email});

        if(exits){
            res.render('userReg', {message: 'Emal Already Excits'})
            return false


        }
        else if (password == conformPassword){

            try {

                const user = User({
                            email:email,
                            name:name,
                            password:spassword,
                            mobile:mno
           
                 });
           
                 const userData = await user.save();
                       
                       

                const otpBody = await otp_gen_fun (req,res);

                res.render('otp',{email:email})

                console.log('Genorated OTP : ',otpBody);



                
            } catch (error) {

                console.log(error.message);
                
            }   


        }else{
            res.render('userReg',{message:'Password Mismatch'})
        }

}    

        // OTP verification after OTP  send to email



const OTPverification = async(req,res)=>{
    

    try {
        
        const otp = req.body.otp;
        const email = req.body.email;
        

        const response = await OTP.find({otp}).sort({createdAt: -1}).limit(1);
        

        if(response.length === 0 || otp !== response[0].otp){
            
            res.render('otp',{message:'otp is incorrect',email})
            //console.log('otp error');

        }else{
            
            const email = req.body.email
            await User.updateOne({email:email},{$set:{is_blocked:false}})
           

             res.render('login')

        }

        


    } catch (error) {
        console.log(error.message);
    }


}


       // user login
       
const isLogin = async (req,res)=>{

    try {

        const email = req.body.email;
        const password =req.body.password;

        const userData = await User.findOne({email:email})

        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password)

            if(passwordMatch){

                    if(userData.is_blocked === false){

                        req.session.user_id = userData._id;
                        console.log(req.session.user_id);
                        res.redirect('/home')
                    
                    }else{
                        res.render('login',{message:'Admin blocked you'})
                    }

            }
            else{
                res.render('login',{message:'Email and Password is incorrect'})
            }


        }
        else{
            res.render('login',{message:'Email and Password is incorrect'})
        }


    } catch (error) {
        console.log(error.message)
    }

}

const loadWishilist = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const wishilistData = await Wishilist.findOne({userId:userid}).populate('items.productId')
        res.render('wishilist',{wishilistData:wishilistData})

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
            return res.json({success:tru})
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
    addToCartFromWishilist
    
    
}