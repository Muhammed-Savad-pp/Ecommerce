const { tryEach, log } = require('async');
const User = require('../model/user_model');
const Category = require('../model/category_model')
const Product = require('../model/product_model')
const bcrypt = require('bcrypt');
const sharp = require('sharp');
const { $regex } = require('sift');
const Order = require('../model/order_model')
const Coupen = require('../model/coupen_model')


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

        res.render('dashboard')
        
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

const 
usersList = async(req,res)=>{

    try {

        userData = await User.find({is_admin:false})

        res.render('userlist',{users:userData});
        
    } catch (error) {
        console.log(error)
    }

}

const blockuser = async(req,res)=>{

    try {

        const userId = req.query.userId;
        //console.log(userId,'userid');
        
        
        const user = await User.findOne({_id:userId});
        //console.log(user,'useruser');
        
        
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
       
        //console.log(CategoryDatas)
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
        
        //console.log(categoryData);
      
    } catch (error) {
        console.log(error.message);
    }
}

const editCategoryload = async(req,res)=>{

    try {

         const errmsg = req.flash('errmsg')
        const id = req.query.id;
        //console.log(id)
        const cateData = await Category.findOne({_id:id})
        //console.log(cateData);
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
        console.log(id);
        await Category.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
        res.redirect("/admin/categories")

    } catch (error) {
        console.log(error);
    }

}

const loadProduct = async(req,res)=>{

    try {

        const productsData = await Product.find().populate('category')
        //console.log(productsData)
        res.render('productlist',{productsDatas:productsData})

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
        // console.log(name);
        // const excits = await Product.findOne({ pname: { $regex: new RegExp(`^${name}$`, 'i') } });
        // console.log(excits);
         const categoryId = await Category.findOne({name:category},{_id:1})

         const normalizedProductName = name.trim().toLowerCase();

         const existingProduct = await Product.findOne({}).exec();

       if (existingProduct) {
            const existingProductName = existingProduct.pname.trim().toLowerCase();

            if (existingProductName === normalizedProductName) {
                // Product name already exists
                return res.render('addproduct', { message: 'Product name already exists' });
            }
        }
       

        

        

        // if(excits){
        //     res.render('addproduct',{message:'Product Name already excits'})
        //     return false
        // }



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
                image:croppedimages


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
        // console.log(id);
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
        console.log(existprooduct);

        

        const productimages = existprooduct.image
        console.log(productimages);

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

        const productData = await Product.findByIdAndUpdate({_id:productid},{$set:{pname:req.body.name,description:req.body.description,category:req.body.category._id,price:req.body.price,quantity:req.body.stock,image:images}})

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
        
        const ordersData = await Order.find();
        
        res.render('adminOrder',{ordersData:ordersData})

    } catch (error) {
        console.log(error.message);
    }

}

const loadOrderDetailPage = async(req,res)=>{

    try {
        

        const orderid = req.query.id;
        //console.log(orderid);
        const orderData = await Order.findOne({orderId:orderid}).populate('items.productId');
        //console.log(orderData);
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

        console.log('productId',productId);
       console.log('orderId',orderId);
       console.log('status',status);


        
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


const approveReturnProduct = async(req,res)=>{

    try {
        
      
        const orderid = req.body.orderId;
        const productid = req.body.productId;

        const approveData = await Order.findOneAndUpdate(
            {orderId:orderid,'items.productId':productid},
            {$set:{approvel:2,'items.$[item].Status':'Return'}},
            {
                arrayFilters:[{'item.productId':productid}],
                new:true
            }
        )
        if(approveData){
            
            const reasons = approveData.items.find(item =>item.productId.equals(productid))
            const reason = reasons.reason;
            const quantity = reasons.quantity;

            
            if(reason != 'Defective or Damaged Product'){
                const product = await Product.findById(productid);
                
                product.quantity += quantity
                await product.save();

            }
            res.status(200).json({success:true})
        }

       

    } catch (error) {
        console.log(error.message);
    }


}

const declineReturnProduct = async(req,res)=>{

    try {

        console.log('asdasd');
        const orderid = req.body.orderId;
        const productid = req.body.productId;
        console.log('orderid',orderid);
        console.log('productid',productid);

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
        console.log('adfsdfsd');
      
        const code = req.body.code;
        const description = req.body.description;
        const MinPrice = req.body.MinPrice;
        const discount = req.body.discount;
        const ucode = code.toUpperCase();

        const exicts = await Coupen.findOne({coupenCode:code})
        if(exicts){
            res.json({success:false})
        }else{
            const coupenData = new Coupen({
                coupenCode:ucode,
                discription:description,
                minPrice:MinPrice,
                discount:discount
            })
            await coupenData.save();
            res.json({success:true})
        }
       

    
    } catch (error) {
        console.log(error.message);
    }

}


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
    addCoupens

}