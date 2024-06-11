
const User = require('../model/user_model');
const Order = require('../model/order_model');
const Product = require('../model/product_model');
const Wallet = require('../model/wallet_model')
const Cart = require('../model/cart_model');
const Wishilist = require('../model/wishilist_modal')

const LoadOrderDatails = async(req,res)=> {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const skip = (page-1) * limit;

        const userid = req.session.user_id;
        const userdata = await User.findOne({_id:userid})

        const Totalorderdata = await Order.find({userId:userid}).populate('items.productId')

        const orderdata = await Order.find({userId:userid}).populate('items.productId').sort({currendDate:-1}).skip(skip).limit(limit)


        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];

        res.render('userOrderDetailsPage',{userdata:userdata,orderDatas:orderdata,cartsdata, wishilistData,currentPage: page,totalPages:Math.ceil(Totalorderdata.length / limit)})
        
    } catch (error) {
        console.log(error.message);
    }

}

const LoadSingleOrderDeatails = async(req,res) =>{
    try {
        
        const userid = req.session.user_id;
        const orderid = req.query.id;
        const orderData = await Order.findOne({userId:userid,orderId:orderid}).populate('items.productId')
        const userData = await User.findById({_id:userid})

        const carts = await Cart.findOne({ userId: userid }).populate("product.productId");
        const cartsdata = carts ? carts.product : [];

        const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
        const wishilistData = wishilist ? wishilist.items : [];
        
        res.render('viewSingleOrderdetails',{orderData:orderData, userData:userData,cartsdata,wishilistData})

    } catch (error) {
        console.log(error.message);
    }
}


const cancelorder = async(req,res)=>{

    try {
        
        const orderId = req.body.orderId;
        const productId = req.body.productId;
        const cancelReason = req.body.selectedReason;
        const userid = req.session.user_id;
       
        const cancelData = await Order.findOneAndUpdate(
                {orderId:orderId,'items.productId':productId},

                {$set:{'items.$[item].Status':'Cancelled','items.$[item].reason':cancelReason}},

                {
                    arrayFilters:[{'item.productId':productId}],
                    new:true
                }
        );
       
        
        if(cancelData){
            
            const canceledItem = cancelData.items.find(item => item.productId.equals(productId))
            
            const canceledQuantity = canceledItem.quantity;
            
            const product = await Product.findById(productId)
            
            product.quantity += canceledQuantity;
           
            await product.save();

            var walletAmount = product.price * canceledQuantity
            if(cancelData.paymentMethod == 'razorPay' || cancelData.paymentMethod == 'wallets' ){

                const wallet = await Wallet.findOne({UserId:userid});

                if(wallet){

                    const updateBalance = wallet.balance + walletAmount;
                    wallet.balance = updateBalance;

                    wallet.history.push({
                        amount:walletAmount,
                        transactionType:'Refund'
                    })

                    await wallet.save()
                    res.status(200).json({success:true})

                }else{

                    const data = new Wallet({

                        UserId:userid,
                        balance:walletAmount,
                        history:[{
                            amount:walletAmount,
                            transactionType:'Refund'
                        }]

                    })
                    await data.save()
                    res.status(200).json({success:true})
                }
            }          
            res.status(200).json({success:true})

        }

    } catch (error) {
        console.log(error.message);
    }


}

const returnOrder = async(req,res)=>{

    try {
        
        const orderId = req.body.orderId;
        const productId = req.body.productId;
        const selectedReason = req.body.selectedReason;

        const returnData = await Order.findOneAndUpdate(
            {orderId:orderId,'items.productId':productId},
            {$set:{'items.$[item].reason':selectedReason,approvel:1}},
            {
                arrayFilters:[{'item.productId':productId}],
                new:true
            }                                                    
        )

        if(returnData){
            res.status(200).json({success:true})
        }



    } catch (error) {
        console.log(error.message);
    }


}

const ChangeUserOrderPaymentStatus = async(req,res)=>{

    try {

        const { orderid, userid, paymentStatus} = req.body;

        const updateData = await Order.findOneAndUpdate({userId:userid,orderId:orderid},{$set:{paymentStatus:paymentStatus}},{new:true})

        if(updateData){
            res.json({success:true})
        }
        
    } catch (error) {
        console.log(error.message);
    }


}

module.exports = {
    LoadOrderDatails,
    LoadSingleOrderDeatails,
    cancelorder,
    returnOrder,
    ChangeUserOrderPaymentStatus
}