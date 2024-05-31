const User = require('../model/user_model')
const Address = require('../model/address_model');
const bcrypt = require('bcrypt')
const RazorPay =require('razorpay');
const Wallet = require('../model/wallet_model')
const Cart = require('../model/cart_model')
const Wishilist = require('../model/wishilist_modal')


require('dotenv').config()
const instance = new RazorPay({
    key_id: process.env.RAZORPAY_IDKEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,

});

const securePassword = async (password)=>{
    try{
    
        const passwordHash = await bcrypt.hash(password,10)
         return passwordHash
    }

    catch (error){
        console.log(error.message);
    }

}

const LoadUserProfile = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        //console.log(userid);

        const userdata = await User.findOne({_id:userid})
        //console.log(userdata);

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        res.render('userprofile',{userdata,cartsdata, wishilistData})

    } catch (error) {
        console.log(error.message);
    }


}

const updateUserProfile = async(req,res)=>{

    try {

        const userid = req.session.user_id
        const name = req.body.newname;
        const mobile = req.body.newMobile

        

        const userData = await User.findOneAndUpdate({_id:userid},{$set:{name:name,mobile:mobile}})

        if(userData){
            
            return res.status(200).json({ success: true });
            
        }
        
    } catch (error) {
        console.log(error.message);
    }

}

const updateUserPassword =async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const { oldPassword, newPassword } = req.body;
        //console.log(oldPassword,newPassword);

        const userdata = await User.findOne({_id:userid});

        


        const passwordmatch = await bcrypt.compare(oldPassword,userdata.password)

        if(oldPassword === newPassword){

            console.log('new pASSWORD Old password is same');
            return  res.status(404).json({success:false})
            

        }

        else if(passwordmatch){

            const spassword = await securePassword(newPassword);


 
            const updatepassword = await User.findOneAndUpdate({_id:userid},{$set:{password:spassword}})
            //console.log(updatepassword);
            return res.status(200).json({success:true})

        }else{
            return  res.status(404).json({success:false})
        }


    } catch (error) {
        console.log(error.message);
    }


}

const loadAddress = async(req,res)=>{

    try {

        const userid = req.session.user_id;
        
        const userdata = await User.findOne({_id:userid})
        const addressData = await Address.findOne({userId:userid})

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        
        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];
         
        res.render('useraddress',{userdata:userdata,addressData:addressData,cartsdata, wishilistData})

    } catch (error) {
        console.log(error.message);
    }
}

const addAddressLoad = async(req,res)=>{

    try { 
        
        const userid = req.session.user_id
        const userdata = await User.findOne({_id:userid})

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        res.render('addaddress',{userdata,cartsdata, wishilistData})

    } catch (error) {
        console.log(error.message);
    }

}

const addadress = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;

        const {name, city, district, state, country, mno, pincode} = req.body

        //console.log(name, city, district, state, country, mno, pincode);

        const address = await Address.findOne({userId:userid})

        if(address){

            address.address.push({
                name:name,
                city:city,
                district:district,
                state:state,
                country:country,
                mobile:mno,
                pincode:pincode
            })
             await address.save();
             res.redirect('/userAddress')

        }else{

            const address = new Address({

                userId:userid,
                address:[{
                    name:name,
                    city:city,
                    district:district,
                    state:state,
                    country:country,
                    mobile:mno,
                    pincode:pincode
                }]

            })

            await address.save()

            res.redirect('/userAddress')

        }


    } catch (error) {
        console.log(error.message);
    }

}

const deleteAddress = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const addressid = req.query.id 
        
        const updateaddress = await Address.findOneAndUpdate({userId:userid},{$pull:{address:{_id:addressid}}});

        if(updateaddress){
            res.json({success:true})
        }

    } catch (error) {
        console.log(error.message);
    }

}


const editaddressload = async(req,res)=>{

    try {
        
        const userid = req.session.user_id
        const userdata = await User.findOne({_id:userid})

        const addressid = req.query.id;
        const addressData = await Address.findOne({userId:userid,'address._id':addressid})

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];
        
       
        if(addressData){

            const foundaddress =  addressData.address.find(addr => addr._id.toString() === addressid)

            

            if(foundaddress){

                res.render('editaddress',{userdata, address:foundaddress,cartsdata , wishilistData})
                
            }
        }
      

    } catch (error) {
        console.log(error.message);
    }
}


const updateaddress = async(req,res) =>{

    try {
        
        const {name, city, district, state, country, mno, pincode } = req.body;
        const userid = req.session.user_id;
        
        const addressid = req.body.id;
        

        const addressdata = await Address.findOne({userId:userid,'address._id':addressid})

        if(addressdata){

            const foundaddress = addressdata.address.find((addr)=> addr._id.toString() === addressid)
           
                if(foundaddress){
                    const updateAddress = await Address.findOneAndUpdate({userId:userid,address:foundaddress},

                     {$set:{
                            'address.$.name':name,
                            'address.$.city':city,
                            'address.$.district':district,
                            'address.$.state':state,
                            'address.$.country':country,
                            'address.$.mobile':mno,
                            'address.$.pincode':pincode
                        }},

                    {new:true})

                    if(updateAddress){
                        res.status(200).json({success:true})
                    }
                   
                    
                }else{
                    console.log('foundaddressnot getit');
                }
        }else{
            console.log('address data not get');
        }
        
        
        

    } catch (error) {
        console.log(error.message);
    }

}

const userlogout = async(req,res)=>{

    try {
        
        req.session.user_id = null;
        
        res.redirect('/home')

    } catch (error) {
        console.log(error.message);
    }

}


const LoadWallet = async(req,res)=>{

    try {
        
        const userid = req.session.user_id
        const userdata = await User.findById(userid);
        const wallet = await Wallet.findOne({UserId:userid})

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];
        
        res.render('wallet',{userdata,wallet,cartsdata, wishilistData})

    } catch (error) {
        console.log(error.message);
    }


}

const LoadAddMoney = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const userdata = await User.findById(userid);
        const walletData = await Wallet.findOne({UserId:userid})

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];
        
        res.render('walletAddMoney',{userdata,walletData,cartsdata,wishilistData})

    } catch (error) {
        console.log(error.message);
    }

}

const addMoneyInWalletUsingRazorpay = async(req,res)=>{

    try {
    
    
        const users = await User.findOne({_id:req.session.user_id})
        const amount = req.body.amount
       
    
        const options = {
          amount:amount,
          currency:"INR",
          receipt:'savad3517@gmail.com'
        }
    
        instance.orders.create(options, (err,order)=>{
    
          if(!err){
            res.send({
              succes:true,
              msg:'Wallet money Adedd',  
              amount:amount,
              key_id: process.env.RAZORPAY_IDKEY,
              name: users.name,
              email: users.email
            })
          }else{
    
            console.error("Error Adding money:", err);
            res.status(500).send({ success: false, msg: "Failed to add money" });
          }
        })
      } catch (error) {
        console.log("error from razopay :",error.message);
      }

}

const addmoney = async(req,res)=>{

    try {
        
        const money = req.body.money;
        const balanceMoney = Number(money);

        const userid = req.session.user_id;

        const wallet = await Wallet.findOne({UserId:userid})
        
       
        if(wallet){

            const updateBalance = wallet.balance + balanceMoney;

            wallet.balance = updateBalance;
            wallet.history.push({
                amount:balanceMoney,
                transactionType:'credit'
            });
            await wallet.save()

            res.json({success:true});


        }else{

            const data = new Wallet({

                UserId:userid,
                balance:balanceMoney,
                history:[{
                    amount:balanceMoney,
                    transactionType:'credit'
                }]

            })

            await data.save();
            res.json({success:true})

        }


    } catch (error) {
        console.log(error.message);
    }

}

const loadWithdrawMoneyinWallet = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const userdata = await User.findById(userid);
        const wallet = await Wallet.findOne({UserId:userid});

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        res.render('walletWithdraw',{userdata,wallet,cartsdata, wishilistData})

    } catch (error) {
        console.log(error.message);
    }

}

const withdrawMoneyFromWallet = async(req,res)=>{

    try {
        
        const amount = req.body.amount;
        const withdrawBalance = Number(amount);

        const userid = req.session.user_id;

        const wallet = await Wallet.findOne({UserId:userid});

        if(wallet){
            
            const updateBalance = wallet.balance - withdrawBalance;
            wallet.balance = updateBalance;
            wallet.history.push({
                amount:withdrawBalance,
                transactionType:'debit'

            })
            await wallet.save();
            res.json({success:true})

        }

    } catch (error) {
        console.log(error.message);
    }

}

const LoadWalletTransaction = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const userdata = await User.findById(userid);
        const wallet = await Wallet.findOne({UserId:userid}).populate('history')
        console.log(wallet,'walee');

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        res.render('walletTransaction',{userdata,wallet,cartsdata,wishilistData})

    } catch (error) {
        console.log(error.message);
    }

}



module.exports = {
    LoadUserProfile,
    updateUserProfile,
    updateUserPassword,
    loadAddress,
    addAddressLoad,
    addadress,
    deleteAddress,
    editaddressload,
    updateaddress,
    userlogout,
    LoadWallet,
    LoadAddMoney,
    addMoneyInWalletUsingRazorpay,
    addmoney,
    loadWithdrawMoneyinWallet,
    withdrawMoneyFromWallet,
    LoadWalletTransaction,

}