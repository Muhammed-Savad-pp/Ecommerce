const express = require('express');
const admin_route = express();

const session = require('express-session');
const config = require('../config/adminConfig');
admin_route.use(session({
    secret:config.sessionSecret,
    resave: false,
    saveUninitialized: true,
}))


const nocache = require('nocache')

admin_route.set('view engine','ejs');
admin_route.set('views', 'views/admin');


const bodyparser = require('body-parser');
admin_route.use(bodyparser.json());
admin_route.use(bodyparser.urlencoded({extended:true}));

const adminController = require('../controller/adminController')

const auth = require('../middelware/adminAuth')

const multer = require('multer');

const path = require('path')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/categoryimage'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)

    }
})
const upload = multer({storage:storage})

const proUpload = require('../utils/multer')



admin_route.get('/login',nocache(),auth.isLogout,adminController.loginLoad)

admin_route.post('/Verifyadmin',adminController.verifyLogin)

admin_route.get('/logout',auth.isLogin,adminController.adminlogout)

admin_route.get('/dashboard',nocache(),auth.isLogin,adminController.loadDashbord)




        // users
admin_route.get('/users',auth.isLogin,adminController.usersList)

admin_route.get('/block',auth.isLogin,adminController.blockuser)


        // categories
admin_route.get('/categories',auth.isLogin,adminController.categoryload)

admin_route.post('/addCategory',auth.isLogin,upload.single('categoryimage'),adminController.addcategory)

admin_route.get('/editCatergory',auth.isLogin,adminController.editCategoryload)

admin_route.post('/editCategory',auth.isLogin,upload.single('categoryimage'),adminController.updateCategory)

admin_route.get('/unlistCategory',auth.isLogin,adminController.unlistCategory)

admin_route.get('/deleteCategory',auth.isLogin,adminController.deleteCategory)

admin_route.get('/restore',auth.isLogin,adminController.restoreCategory)


                // product

admin_route.get('/productlist',auth.isLogin,adminController.loadProduct)

admin_route.get('/addproduct',auth.isLogin,adminController.loadAddProduct)

admin_route.post('/addproducts',auth.isLogin,proUpload,adminController.addProduct)

admin_route.get('/unlistproduct',auth.isLogin,adminController.unlistPorduct)

admin_route.get('/listproduct',auth.isLogin,adminController.listProduct)

admin_route.get('/editproduct',auth.isLogin,adminController.editproductsLoad)

admin_route.post('/editproduct',auth.isLogin,proUpload,adminController.updateproducts)


                // orders

admin_route.get('/orders',auth.isLogin,adminController.LoadOrders);

admin_route.get('/orderDetails',auth.isLogin,adminController.loadOrderDetailPage)

admin_route.post('/changeStatus',auth.isLogin,adminController.changeStatus);

admin_route.post('/approve',auth.isLogin,adminController.approveReturnProduct);

admin_route.post('/decline',auth.isLogin,adminController.declineReturnProduct)


            // coupens

admin_route.get('/coupens',auth.isLogin,adminController.LoadCoupens)

admin_route.get('/addcoupens',auth.isLogin,adminController.loadAddCoupen);

admin_route.post('/addCoupen',auth.isLogin,adminController.addCoupens)

admin_route.get('/editcoupen',auth.isLogin,adminController.editCoupens)

admin_route.post('/editcoupens',auth.isLogin,adminController.editcoupesSubmit)

admin_route.post('/deleteCoupen',auth.isLogin,adminController.deletecopen)

admin_route.post('/diActive',auth.isLogin,adminController.diactiveCoupen)

admin_route.post('/active',auth.isLogin,adminController.activeCoupen)

            // offers categroys

admin_route.get('/offerCategory',auth.isLogin,adminController.LoadCategoryOffer);

admin_route.get('/addCategoryOffer',auth.isLogin,adminController.LoadAddCategoryOffer)

admin_route.post('/addCategoryOffer',auth.isLogin,adminController.addCategoryOffer)

admin_route.post('/deleteCategoryOffer',auth.isLogin,adminController.delectCategoryOffer)

admin_route.get('/editCategoryOffer',auth.isLogin,auth.isLogin,adminController.loadEditCategoryOffer)

admin_route.post('/editCategoryOffer',auth.isLogin,adminController.editCategoryOffer)

admin_route.post('/CategoryOfferdiActive',auth.isLogin,adminController.diactiveCategoryOffer);

admin_route.post('/CategoryOfferActive',auth.isLogin,adminController.CategoryOfferActive)


                    //  offers products

admin_route.get('/productOffer',auth.isLogin,adminController.loadProductOffer)

admin_route.get('/addproductOffer',auth.isLogin,adminController.LoadAddProductOffer)

admin_route.post('/addProductOffer',auth.isLogin,adminController.addProductOffer);

admin_route.post('/ProductOfferdiActive',auth.isLogin,adminController.diactiveProductOffer);

admin_route.post('/ProductOfferActive',auth.isLogin,adminController.activeProductOffer);

admin_route.get('/editproductOffer',auth.isLogin,adminController.loadEditProductOffer)

admin_route.post('/editProductOffer',auth.isLogin,adminController.updateProductOffer);

admin_route.post('/deleteProductOffer',auth.isLogin,adminController.delectProductOffer)



            // sales

admin_route.get('/salesreport',auth.isLogin,adminController.LoadSalesReport)




admin_route.get('*',(req,res)=>{
    res.redirect('/admin')
})


module.exports = admin_route