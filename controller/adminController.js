const { tryEach, log } = require('async');
const User = require('../model/user_model');
const Category = require('../model/category_model')
const Product = require('../model/product_model')
const bcrypt = require('bcrypt');
const sharp = require('sharp');
const { $regex, $gte } = require('sift');
const Order = require('../model/order_model')
const Coupen = require('../model/coupen_model')
const CategoryOffer = require('../model/categoryOffer_model')
const ProductOffer = require('../model/productOffer_model');
const { findOneAndUpdate } = require('../model/cart_model');
const Wallet = require('../model/wallet_model')

const securePassword = async (req,res)=>{

    try {
        
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash


    } catch (error) {
        console.log(error.message)
    }

}

const loadDashbord = async(req,res)=>{

    try {


        const orderData = await Order.find();

        const overolAmount =  orderData.reduce((acc,order)=>{
                return acc=acc+order.totalAmount
        },0)

        let prodcutCount =0;
        for(let i=0;i<orderData.length;i++){
            const product = orderData[i].items
            for(let j=0;j< product.length; j++ ){
                prodcutCount= prodcutCount+product[j].quantity
            }
        }

                // top products
        const topProducts = await Product.find().sort({count:-1}).limit(2);

                // top categories
        const topCategories = await Category.find().sort({count:-1}).limit(2)

                // category chart
        const Categroies = await Category.find()
        const categoryData = Categroies.map(category =>({

            name:category.name,
            count:category.count

        }))

        const weekSales = Array(7).fill(0);
        const monthSales = Array(4).fill(0);
        const yearSales = Array(12).fill(0);

        orderData.forEach(order => {
            const date = new Date(order.currendDate);
            const day = date.getDay(); // 0-6 (Sunday-Saturday)
            const month = date.getMonth(); // 0-11 (Jan-Dec)
            const week = Math.floor(date.getDate() / 7); // Week of the month
            
            // Calculate total amount per period
            weekSales[day] += order.totalAmount;
            monthSales[week] += order.totalAmount;
            yearSales[month] += order.totalAmount;
        });

      
  
        res.render('dashboard',{overolAmount, orderData, prodcutCount, topProducts, topCategories ,week:weekSales, month:monthSales, year:yearSales,categoryData:categoryData})
        
    } catch (error) {
        console.log(error.message);
    }

}



const loginLoad = async(req,res)=>{

    try {
        
        res.render('adminLogin')

    } catch (error) {
        console.log(error.message);
    }

}

const verifyLogin = async(req,res)=>{
   
    try {
        
        const {email, password } = req.body;   

        const userData = await User.findOne({email:email})

        if(userData){
            

                const passwordMatch = await bcrypt.compare(password,userData.password);

                if(passwordMatch){
                    if(userData.is_admin === false){

                        res.render('adminLogin',{message:'Your not allowed'});

                    }else{
                         req.session.admin_id = userData._id;

                      
                        res.redirect('/admin/dashboard');
                    }
                }else{
                    res.render('adminLogin',{message:'Email and Password is incorrect'})
                }
        }else{
            res.render('adminLogin',{message:'Email and password is incorrect'})
        }


    } catch (error) {
        console.log(error)
    }


}

const adminlogout = async(req,res)=>{

    try {

        req.session.admin_id = null;
        
        res.redirect('/admin/login')
        
    } catch (error) {
        console.log(error);
    }

}

const usersList = async(req,res)=>{

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 7;
        const skip = (page-1) * limit;

        const totaluserData = await User.find({is_admin:false})

        const userDatas = await User.find({is_admin:false}).skip(skip).limit(limit)


        res.render('userlist',{users:userDatas,currentPage: page,totalPages:Math.ceil(totaluserData.length / limit)});
        
    } catch (error) {
        console.log(error)
    }

}

const blockuser = async(req,res)=>{

    try {

        const userId = req.query.userId;        
        
        const user = await User.findOne({_id:userId});        
        
        if(!user){
            res.status(404).send('User not found')
            return;

        }

        const isBlocked = user.is_blocked;

        if(isBlocked === true){

            await User.findByIdAndUpdate(userId,{$set:{is_blocked:false}})
            res.json({success:true})

        }else{
            await User.findByIdAndUpdate(userId,{$set:{is_blocked:true}})
            res.json({success:true})

        }
      
        
    } catch (error) {
        console.log(error)
    }

}

const categoryload = async(req,res)=>{

    try {

        CategoryDatas = await Category.find({is_blocked : false})
       
        res.render('categories',{categories:CategoryDatas})
    
        
    } catch (error) {
        console.log(error);
    }

}

const addcategory = async(req,res)=>{

    try {

        const name = req.body.name
        const excits = await Category.findOne({name:{ $regex: new RegExp(`^${name}$`, 'i')}});
        CategoryDatas = await Category.find({is_blocked : false})
        if(excits){
            res.render('categories',{categories:CategoryDatas,message:'Name already excits'})
            return false
        }else{

            const category = new Category({

                name:name,
                image:req.file.filename
                
            });

            const categoryData = await category.save()
        }
        
      
    } catch (error) {
        console.log(error.message);
    }
}

const editCategoryload = async(req,res)=>{

    try {

         const errmsg = req.flash('errmsg')
        const id = req.query.id;
        const cateData = await Category.findOne({_id:id})
        if(cateData){
           
            res.render('categoryedit',{cateData:cateData,errmsg:errmsg})
        }
        
        
    } catch (error) {
        console.log(error);
    }

}

const updateCategory = async(req,res)=>{

    try {

        const id = req.body.id 
        
        const newname = req.body.name;
        
        const excits = await Category.findOne({name:{ $regex: new RegExp(`^${newname}$`, 'i')}});

        if(excits){
            req.flash('errmsg','Name alredy exitcs')
            res.redirect('/admin/editCatergory')
            
        }else{

            const CategoryData = await Category.findByIdAndUpdate({_id:id},{$set:{name:req.body.name,image:req.file.filename}})
            res.redirect('/admin/categories')

        }

    } catch (error) {
        console.log(error);
    }


}

const unlistCategory = async(req,res)=>{

    try {

        const unlistCategoryData = await Category.find({is_blocked:true})

        res.render('unlistCategory',{unlistData:unlistCategoryData})
        
    } catch (error) {
        console.log(error);
    }

}

const deleteCategory = async(req,res)=>{

    try {

        const id = req.query.id;
        await Category.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
        res.redirect("/admin/categories")
    } catch (error) {
        console.log(error);
    }
}

const restoreCategory = async(req,res)=>{

    try {
        
        const id = req.query.id;
        await Category.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
        res.redirect("/admin/categories")

    } catch (error) {
        console.log(error);
    }

}

const loadProduct = async(req,res)=>{

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page-1) * limit;

        const totalproductsData = await Product.find().populate('category')
        const productsData = await Product.find().populate('category').skip(skip).limit(limit)

        res.render('productlist',{productsDatas:productsData,currentPage: page,totalPages:Math.ceil(totalproductsData.length / limit)})

    } catch (error) {
        console.log(error.message);
    }

}

const loadAddProduct = async(req,res)=>{

    try {
    
        const categoryData = await Category.find()
        
        res.render('addproduct',{categorys:categoryData})

    } catch (error) {
        console.log(error);
    }

}

const addProduct = async(req,res)=>{

    try {
        
        
        const {name,description,category,price,stock,} = req.body
      
         const categoryId = await Category.findOne({name:category},{_id:1})

         const normalizedProductName = name.trim().toLowerCase();

         const existingProduct = await Product.findOne({}).exec();

       if (existingProduct) {
            const existingProductName = existingProduct.pname.trim().toLowerCase();

            if (existingProductName === normalizedProductName) {
                return res.render('addproduct', { message: 'Product name already exists' });
            }
        }
       
        let croppedimages  = [];
        let imagePath = [];

        for(let i=0; i<req.files.length; i++){
            const croppedBuffer = await sharp(req.files[i].path)
            .resize({width:400,height:500, fit:sharp.fit.cover})
            .toBuffer();

            const filename = `cropped_${req.files[i].originalname}`;
            croppedimages.push(`/productimage/${filename}`);
            await sharp(croppedBuffer).toFile(`public/productimage/${filename}`);
        }


            const products = new Product({
                pname:name,
                description:description,
                price:price,
                category:categoryId,
                quantity:stock,
                image:croppedimages,
                offerprice:null


            });

            const productsData = await products.save();

        
        
        if(productsData){
            res.redirect('/admin/productlist')
        }


    } catch (error) {
        console.log(error);

    }

}

const unlistPorduct = async(req,res)=>{

    try {
        
        const id = req.query.id;
        await Product.findByIdAndUpdate({_id:id},{$set:{is_delete:true}});
        res.redirect('/admin/productlist')

    } catch (error) {
        console.log(error.message);
    }


}

const listProduct = async(req,res)=>{

    try {
        
        const id = req.query.id;
        await Product.findByIdAndUpdate({_id:id},{$set:{is_delete:false}})
        res.redirect('/admin/productlist');

    } catch (error) {
        console.log(error.message);
    }


}

const editproductsLoad = async(req,res)=>{

    try {
        
        const id = req.query.id;
        const categorydata = await Category.find()
        const productsdata = await Product.findOne({_id:id})
        res.render('editproduct',{productsData:productsdata,categorys:categorydata})

    } catch (error) {
        console.log(error.message);
    }

}

const updateproducts = async(req,res)=>{

    try {  
        const productid = req.body.id
        const existprooduct = await Product.findById(productid)
        const productimages = existprooduct.image
        

        let croppedimages  = [];

        for(let i=0; i<req.files.length; i++){
            const croppedBuffer = await sharp(req.files[i].path)
            .resize({width:350,height:450, fit:sharp.fit.cover})
            .toBuffer();

            const filename = `cropped_${req.files[i].originalname}`;
            croppedimages.push(`/productimage/${filename}`);
            await sharp(croppedBuffer).toFile(`public/productimage/${filename}`);
        }

        
        if(req.body.deletedimages){
            const deletedImage = JSON.parse(req.body.deletedimages) 
            
        let filteredImages = existprooduct.image.filter(image => !deletedImage.includes(image));

        croppedimages.push(...filteredImages);
        }

        const images = croppedimages.length > 0 ? croppedimages:productimages

        const productData = await Product.findByIdAndUpdate({_id:productid},{$set:{pname:req.body.name,description:req.body.description,category:req.body.category._id,price:req.body.price,quantity:req.body.stock,image:images,offerprice:null}})

        if(productData){
            res.redirect('/admin/productlist')
        }else{
            res.redirect('/admin/editproduct',{message:'Edit not completed'})
        }

    } catch (error) {
        console.log(error);
    }


}


const LoadOrders = async(req,res)=>{

    try {
        
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page-1) * limit;

        const totalordersData = await Order.find();

        const ordersData = await Order.find().sort({currendDate:-1}).skip(skip).limit(limit);

        
        res.render('adminOrder',{ordersData:ordersData,currentPage: page,totalPages:Math.ceil(totalordersData.length / limit)})

    } catch (error) {
        console.log(error.message);
    }

}

const loadOrderDetailPage = async(req,res)=>{

    try {
        

        const orderid = req.query.id;
        const orderData = await Order.findOne({orderId:orderid}).populate('items.productId');
        res.render('orderDetailPage',{orderData:orderData})

    } catch (error) {
        console.log(error.message);
    }


}

const changeStatus = async(req,res)=>{

    try {
        
        const orderId = req.body.orderId;
        const productId = req.body.productId;
        const status = req.body.status
       
        const cancelData = await Order.findOneAndUpdate(
                {orderId:orderId,'items.productId':productId},

                {$set:{'items.$[item].Status':status}},

                {
                    arrayFilters:[{'item.productId':productId}],
                    new:true
                }
        );
        
        if(cancelData){
            res.status(200).json({success:true})
        }

    } catch (error) {
        console.log(error.message);
    }


}


const approveReturnProduct = async (req, res) => {
    try {
        const orderid = req.body.orderId;
        const productid = req.body.productId;

        const approveData = await Order.findOneAndUpdate(
            { orderId: orderid, 'items.productId': productid },
            { $set: { approvel: 2, 'items.$[item].Status': 'Return' } },
            { arrayFilters: [{ 'item.productId': productid }], new: true }
        );

        if (approveData) {
            let totalprice = 0;

            approveData.items.forEach(item => {
                if (item.productId.equals(productid)) {
                    totalprice += item.price * item.quantity;
                }
            });

            const reasons = approveData.items.find(item => item.productId.equals(productid));
            const { reason, quantity } = reasons;

            if (reason !== 'Defective or Damaged Product') {
                const product = await Product.findById(productid);
                if (product) {
                    product.quantity += quantity;
                    await product.save();
                }
            }

            const userid = approveData.userId;

            const walletData = await Wallet.findOneAndUpdate(
                { UserId: userid },
                {
                    $inc: { balance: totalprice }, 
                    $push: {
                        history: {
                            amount: totalprice,
                            transactionType: 'Refund',
                        }
                    }
                },
                { new: true, upsert: true }
            );

            res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};


const declineReturnProduct = async(req,res)=>{

    try {

        const orderid = req.body.orderId;
        const productid = req.body.productId;
       

        const declineData = await Order.findOneAndUpdate({orderId:orderid,'items.productId':productid},{$set:{approvel:3}},{new:true})

        if(declineData){
            res.status(200).json({success:true})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}



const LoadCoupens = async(req,res)=>{

    try {
        
        const coupensData = await Coupen.find()
        res.render('coupenList',{coupensData:coupensData})

    } catch (error) {
        console.log(error.message);
    }

}

const loadAddCoupen = async(req,res)=>{

    try {
        
        res.render('addCoupen')

    } catch (error) {
        console.log(error.message);
    }

}

const addCoupens = async(req,res)=>{

    try {
      
        const code = req.body.code;
        const description = req.body.description;
        const MinPrice = req.body.MinPrice;
        const discount = req.body.discount;
        const validity = req.body.validity;
        const ucode = code.toUpperCase();

        const exicts = await Coupen.findOne({coupenCode:code})
        if(exicts){
            res.json({success:false})
        }else{
            const coupenData = new Coupen({
                coupenCode:ucode,
                discription:description,
                minPrice:MinPrice,
                discount:discount,
                validity:validity
            })
            await coupenData.save();
            res.json({success:true})
        }
       

    
    } catch (error) {
        console.log(error.message);
    }

}

const editCoupens = async(req,res)=>{

    try {
        
        const coupenid = req.query.id;
        const coupenData = await Coupen.findById({_id:coupenid});
       
        res.render('coupenEdit',{data:coupenData})

    } catch (error) {
        console.log(error.message);
    }

}

const editcoupesSubmit = async(req,res)=>{

    try {
        
        const coupenId = req.query.id
        const code = req.body.code;
        const description = req.body.description;
        const MinPrice = req.body.MinPrice;
        const discount = req.body.discount;
        const validity = req.body.validity;
        const ucode = code.toUpperCase();
        const excits = await Coupen.findOne({coupenCode:{ $regex: new RegExp(`^${ucode}$`, 'i')}});

        if(excits){
            return res.json({success:false})
        }else{

            await Coupen.findByIdAndUpdate({_id:coupenId},{$set:{
                coupenCode:ucode,
                discription:description,
                minPrice:MinPrice,
                discount:discount,
                validity:validity
            }},{new:true})

            res.json({success:true})
        }    

    } catch (error) {
        console.log(error.message);
    }

}


const deletecopen = async(req,res)=>{

    try {
        
        const coupenid = req.body.id;
        const deleteCoupen = await Coupen.findByIdAndDelete(coupenid)
        if(deleteCoupen){
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }

}

const diactiveCoupen = async(req,res)=>{

    try {
        
        const id = req.body.id;
        const updateData = await Coupen.findByIdAndUpdate({_id:id},{$set:{is_active:false}})
        if(updateData){
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }

}

const activeCoupen = async(req,res)=>{

    try {
        
        const id = req.body.id;
        const upadateData = await Coupen.findByIdAndUpdate({_id:id},{$set:{is_active:true}})
        if(upadateData){
            res.json({success:true})
        }

    } catch (error) {
        console.log(error.message);
    }

}

const LoadCategoryOffer = async(req,res)=>{

    try {
        const categoryOffer = await CategoryOffer.find().populate('categoryId')
        res.render('catogoryoffer',{categoryOffer})

    } catch (error) {
        console.log(error.message);
    }
}

const LoadAddCategoryOffer = async(req,res)=>{

    try {
        
        const category = await Category.find()
        res.render('addCategoryOffer',{category})

    } catch (error) {
        console.log(error.message);
    }

}

const addCategoryOffer = async(req,res)=>{


        try {
            
            const categoryname = req.body.category;
            const discount = req.body.discount;
            const date = req.body.date

            const exicts = await CategoryOffer.findOne({categoryId:categoryname})

            if(exicts){

                res.json({success:false})

            }else{

                const updateData = new CategoryOffer({
                    categoryId:categoryname,
                    offer:discount,
                    validity:date
                })

                await updateData.save();
                res.json({success:true})

            }
        } catch (error) {
            console.log(error.message);
        }
}


const delectCategoryOffer = async(req,res)=>{

    try {

        const id = req.body.id
        const deleteData = await CategoryOffer.findByIdAndDelete(id);
        if(deleteData){
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }

}

const loadEditCategoryOffer = async(req,res)=>{

    try {

        const category = await Category.find()
        const id = req.query.id
      
        const offerData  = await CategoryOffer.findById(id)
        res.render('editCategoryOffer',{category,offerData})
    } catch (error) {
        console.log(error.message);
    }


}

const editCategoryOffer = async(req,res)=>{

    try {

        const categoryid = req.body.category;
        const discount = req.body.discount;
        const date = req.body.date
        const id = req.body.id

        const exits = await CategoryOffer.findOne({categoryId:categoryid});

        if(exits){
            res.json({success:false})
        }else{
            await CategoryOffer.findByIdAndUpdate(id,{$set:{categoryId:categoryid,offer:discount,validity:date}},{new:true})
            res.json({success:true})
        }
        
    } catch (error) {
        console.log(error.message);
    }


}

const diactiveCategoryOffer = async(req,res)=>{

    try {
        
        const id = req.body.id;

        const updateData = await CategoryOffer.findByIdAndUpdate(id,{$set:{activation:false}},{new:true})

        if(updateData){
            res.json({success:true})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const CategoryOfferActive = async(req,res)=>{

    
    try {
        
        const id = req.body.id;

        const updateData = await CategoryOffer.findByIdAndUpdate(id,{$set:{activation:true}},{new:true})

        if(updateData){
            res.json({success:true})
        }

    } catch (error) {
        console.log(error.message);
    }


}


const loadProductOffer = async(req,res)=>{

    try {
        
        const offer = await ProductOffer.find().populate('ProductId')
        res.render('productoffer',{offer})

    } catch (error) {
        console.log(error.message);
    }

}

const LoadAddProductOffer = async(req,res)=>{

    try {
        
        const prodcut = await Product.find()
            res.render('addProductOffer',{prodcut})

    } catch (error) {
        console.log(error.message);
    }

}

const addProductOffer = async(req,res)=>{

    try {
        
        const {productid, discount, date} = req.body;
        const exicts = await ProductOffer.findOne({ProductId:productid})

        const product = await Product.findById(productid)
        const price = product.price
        

            if(exicts){

                res.json({success:false,message:'Product  Already Added Offer'})

            }else if( price <=  90){
                return res.json({success:false, message:'Product prize minimum 90 '})
            }
            else{

                const updateData = new ProductOffer({
                    ProductId:productid,
                    offer:discount,
                    validity:date
                })

                await updateData.save();
                res.json({success:true})

            }


    } catch (error) {
        console.log(error.message);
    }

}

const diactiveProductOffer = async(req,res)=>{

    try {
        
        const id = req.body.id
        const updateData = await ProductOffer.findByIdAndUpdate(id,{$set:{activation:false}})
        if(updateData){
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }

}

const activeProductOffer = async(req,res)=>{

    try {
        
        const id = req.body.id
        const updateData = await ProductOffer.findByIdAndUpdate(id,{$set:{activation:true}})
        if(updateData){
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }

}

const loadEditProductOffer = async(req,res) =>{

    try {
        
        const prodcut = await Product.find()
        const id = req.query.id;
        const data = await ProductOffer.findById(id)
        res.render('editProductOffer',{data,prodcut})

    } catch (error) {
        console.log(error.message);
    }

}

const updateProductOffer = async(req,res)=>{

    try {

        const productid = req.body.productid;
        const discount = req.body.discount;
        const date = req.body.date
        const id = req.body.id

        const exits = await ProductOffer.findOne({ProductId:productid});

        const product = await Product.findById(productid)
        const price = product.price

       if(price <= 90){
         return res.json({success:false, message:'Product prize minimum 90 '})
       }else{
        await ProductOffer.findByIdAndUpdate(id,{$set:{ProductId:productid,offer:discount,validity:date}},{new:true})
        res.json({success:true})
       }
                
    } catch (error) {
        console.log(error.message);
    }


}

const delectProductOffer = async(req,res)=>{

    try {
        
        const id = req.body.id
        const deleteData = await ProductOffer.findByIdAndDelete(id);
        if(deleteData){
            res.json({success:true})
        }

    } catch (error) {
        console.log(error.message);
    }


}

const LoadSalesReport = async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page-1) * limit;

        const { type, date ,startDate, endDate } = req.query;

        const totalSales = await Order.find().populate('items.productId');
       

        let sales;
        let subtotal=0;
        let discount =0;

        if (type === 'Today') {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            sales = await Order.find({
                currendDate: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }).sort({currendDate:-1}).skip(skip).limit(limit).populate('items.productId');

            sales.forEach(val =>{
                val.items.forEach(item =>{
                    subtotal  += item.productId.price * item.quantity;
                })
            })

            sales.forEach(val =>{
                discount += val.discount
            })

        } else if (type === 'Last Week') {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastWeekStart = new Date(today);
            lastWeekStart.setDate(today.getDate() - 7);

            const lastWeekEnd = new Date(today);
            lastWeekEnd.setDate(today.getDate() - 1);

            sales = await Order.find({
                currendDate: {
                    $gte: lastWeekStart,
                    $lte: lastWeekEnd
                }
            }).sort({currendDate:-1}).skip(skip).limit(limit).populate('items.productId');

            sales.forEach(val =>{
                val.items.forEach(item =>{
                    subtotal  += item.productId.price * item.quantity;
                })
            })

            sales.forEach(val =>{
                discount += val.discount
            })

        } else if (type === 'Last Month') {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

            sales = await Order.find({
                currendDate: {
                    $gte: lastMonthStart,
                    $lte: lastMonthEnd
                }
            }).sort({currendDate:-1}).skip(skip).limit(limit).populate('items.productId');

            sales.forEach(val =>{
                val.items.forEach(item =>{
                    subtotal  += item.productId.price * item.quantity;
                })
            })

            sales.forEach(val =>{
                discount += val.discount
            })

        } else if (type === 'This Year') {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const thisYearStart = new Date(today.getFullYear(), 0, 1);
            const thisYearEnd = new Date(today.getFullYear() + 1, 0, 0);

            sales = await Order.find({
                currendDate: {
                    $gte: thisYearStart,
                    $lt: thisYearEnd
                }
            }).sort({currendDate:-1}).skip(skip).limit(limit).populate('items.productId');

            sales.forEach(val =>{
                val.items.forEach(item =>{
                    subtotal  += item.productId.price * item.quantity;
                })
            })

            sales.forEach(val =>{
                discount += val.discount
            })

        } else if (startDate && endDate) {

            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            sales = await Order.find({
                currendDate: {
                    $gte: start,
                    $lte: end
                }
            }).sort({currendDate:-1}).skip(skip).limit(limit).populate('items.productId');

            sales.forEach(val => {
                val.items.forEach(item => {
                    subtotal += item.productId.price * item.quantity;
                });
            });

            sales.forEach(val => {
                discount += val.discount;
            });
            
        } else {

            
            sales = await Order.find().sort({currendDate:-1}).skip(skip).limit(limit).populate('items.productId');

            sales.forEach(val =>{
                val.items.forEach(item =>{
                    subtotal  += item.productId.price * item.quantity;
                })
            })

            sales.forEach(val =>{
                discount += val.discount
            })
        }

        res.render('saleslist', { sales,subtotal ,discount ,currentPage: page,totalPages:Math.ceil(totalSales.length / limit)});
    } catch (error) {
        console.error('Error in LoadSalesReport:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    loginLoad,
    loadDashbord,
    verifyLogin,
    usersList,
    blockuser,
    adminlogout,
    categoryload,
    addcategory,
    editCategoryload,
    updateCategory,
    unlistCategory,
    deleteCategory,
    restoreCategory,
    loadProduct,
    loadAddProduct,
    addProduct,
    unlistPorduct,
    listProduct,
    editproductsLoad,
    updateproducts,
    LoadOrders,
    loadOrderDetailPage,
    changeStatus,
    approveReturnProduct,
    declineReturnProduct,
    LoadCoupens,
    loadAddCoupen,
    addCoupens,
    editCoupens,
    editcoupesSubmit,
    deletecopen,
    diactiveCoupen,
    activeCoupen,
    LoadCategoryOffer,
    LoadAddCategoryOffer,
    addCategoryOffer,
    delectCategoryOffer,
    loadEditCategoryOffer,
    editCategoryOffer,
    diactiveCategoryOffer,
    CategoryOfferActive,
    loadProductOffer,
    LoadAddProductOffer,
    addProductOffer,
    diactiveProductOffer,
    activeProductOffer,
    loadEditProductOffer,
    updateProductOffer,
    delectProductOffer,
    LoadSalesReport,

}