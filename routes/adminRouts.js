const express = require('express');
const admin_route = express();

const session = require('express-session');
const config = require('../config/adminConfig');
admin_route.use(session({secret:config.sessionSecret}))


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

admin_route.get('/block',adminController.blockuser)


        // categories
admin_route.get('/categories',auth.isLogin,adminController.categoryload)

admin_route.post('/addCategory',upload.single('categoryimage'),adminController.addcategory)

admin_route.get('/editCatergory',auth.isLogin,adminController.editCategoryload)

admin_route.post('/editCategory',upload.single('categoryimage'),adminController.updateCategory)

admin_route.get('/unlistCategory',auth.isLogin,adminController.unlistCategory)

admin_route.get('/deleteCategory',auth.isLogin,adminController.deleteCategory)

admin_route.get('/restore',auth.isLogin,adminController.restoreCategory)


                // product

admin_route.get('/productlist',auth.isLogin,adminController.loadProduct)

admin_route.get('/addproduct',auth.isLogin,adminController.loadAddProduct)

admin_route.post('/addproducts',proUpload,adminController.addProduct)

admin_route.get('/unlistproduct',auth.isLogin,adminController.unlistPorduct)

admin_route.get('/listproduct',auth.isLogin,adminController.listProduct)

admin_route.get('/editproduct',auth.isLogin,adminController.editproductsLoad)

admin_route.post('/editproduct',proUpload,adminController.updateproducts)


                // orders

admin_route.get('/orders',auth.isLogin,adminController.LoadOrders);

admin_route.get('/orderDetails',auth.isLogin,adminController.loadOrderDetailPage)

admin_route.post('/changeStatus',adminController.changeStatus);

admin_route.post('/approve',adminController.approveReturnProduct);

admin_route.post('/decline',adminController.declineReturnProduct)


            // coupens

admin_route.get('/coupens',auth.isLogin,adminController.LoadCoupens)

admin_route.get('/addcoupens',auth.isLogin,adminController.loadAddCoupen);

admin_route.post('/addCoupen',adminController.addCoupens)






admin_route.get('*',(req,res)=>{
    res.redirect('/admin')
})


module.exports = admin_route