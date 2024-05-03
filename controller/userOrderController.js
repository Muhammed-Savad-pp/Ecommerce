
const User = require('../model/user_model');
const Order = require('../model/order_model');
const Product = require('../model/product_model')


const LoadOrderDatails = async(req,res)=> {

    try {

        const userid = req.session.user_id;
        const userdata = await User.findOne({_id:userid})

        const orderdata = await Order.find({userId:userid}).populate('items.productId')

        res.render('userOrderDetailsPage',{userdata:userdata,orderDatas:orderdata})
        
    } catch (error) {
        console.log(error.message);
    }

}

const LoadSingleOrderDeatails = async(req,res) =>{
    try {
        
        const userid = req.session.user_id;
        const orderid = req.query.id;
        //console.log('orderid',orderid);
        const orderData = await Order.findOne({userId:userid,orderId:orderid}).populate('items.productId')
        const userData = await User.findById({_id:userid})
        //console.log(orderData);
        res.render('viewSingleOrderdetails',{orderData:orderData, userData:userData})

    } catch (error) {
        console.log(error.message);
    }
}


const cancelorder = async(req,res)=>{

    try {
        
        const orderId = req.body.orderId;
        const productId = req.body.productId;
        const cancelReason = req.body.selectedReason;
       
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

        // console.log('orderId',orderId);
        // console.log('productId',productId);
        // console.log('selectedReason',selectedReason);

        const returnData = await Order.findOneAndUpdate(
            {orderId:orderId,'items.productId':productId},
            {$set:{'items.$[item].reason':selectedReason,approvel:1}},
            {
                arrayFilters:[{'item.productId':productId}],
                new:true
            }                                                    
        )

        if(returnData){
            console.log('success');
            res.status(200).json({success:true})
        }



    } catch (error) {
        console.log(error.message);
    }


}

module.exports = {
    LoadOrderDatails,
    LoadSingleOrderDeatails,
    cancelorder,
    returnOrder
}