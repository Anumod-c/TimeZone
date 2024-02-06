const express =require('express')
const adrouter =express.Router();
const adminController =require('./../controllers/adminController');
const productController =require('../controllers/productcontroller');
const orderController =require('../controllers/orderController')
const couponController = require("../controllers/couponController")
const bannerController  = require("../controllers/bannerController")
adrouter.use(express.urlencoded({extended:true}));
const multer =require('multer');
const auth =require('../../middleware/isAuth')
const upload=multer({dest:'uploads/'})  



//admin login page
adrouter.get("/",auth.logoutadmin,adminController.adlogin)


//admin loginpost
adrouter.post('/adloginpost',adminController.adloginpost)

//admin home
adrouter.get('/adminpannel',auth.loggedadmin,adminController.adminpannel)

//userlist
adrouter.get('/userslist',auth.loggedadmin,adminController.userlist)

//update user
adrouter.get('/update/:email',auth.loggedadmin,adminController.userupdate)

//search user
adrouter.post('/searchuser',auth.loggedadmin,auth.loggedadmin,adminController.searchuser)

//view user
adrouter.get('/searchview',auth.loggedadmin,adminController.searchview)

//filter
adrouter.get('/filter/:options',auth.loggedadmin,adminController.filter)

//============================================= CATOGORIES============================================


adrouter.get('/Category',auth.loggedadmin,adminController.category)

adrouter.get('/newcat',auth.loggedadmin,adminController.newcat)

adrouter.post('/add-category',auth.loggedadmin,adminController.addcategory)

adrouter.get('/updatecat/:id',auth.loggedadmin,adminController.updatecat)

adrouter.post('/update-category/:id',auth.loggedadmin,adminController.updatecatpost)

adrouter.get('/unlistcat/:id',auth.loggedadmin,adminController.unlistcat)



//============================================PRODUCT====================================================
adrouter.get('/product',auth.loggedadmin,productController.product)
adrouter.get('/newproduct',auth.loggedadmin,productController.newproduct)
adrouter.post('/addproduct',auth.loggedadmin,upload.array('images'),productController.addproduct)

adrouter.get('/unlist/:id',auth.loggedadmin,productController.unlist)
adrouter.get('/updateproduct/:id',auth.loggedadmin,productController.updateproduct)
adrouter.get('/editimage/:id',auth.loggedadmin,productController.editimage)
adrouter.get('/delimage',auth.loggedadmin,productController.delimage)
adrouter.post('/editimagepost/:id',auth.loggedadmin,upload.array('images'),productController.editimagepost)
adrouter.post('/updateproductpost/:id',auth.loggedadmin,productController.updateproductpost)
adrouter.post('/deleteproduct/:id',auth.loggedadmin,productController.delproduct)
//===================================================orderpage========================================

adrouter.get('/orderPage',auth.loggedadmin,orderController.orderPage)
adrouter.post('/updateOrderStatus',auth.loggedadmin,orderController.updateOrderStatus)
adrouter.get('/filterOrder/:status',auth.loggedadmin,orderController.filterOrder)
adrouter.get("/orderDetails/:id",auth.loggedadmin,orderController.orderDetails)




// =========================================        COUPON     ========================================= 
adrouter.get("/couponList",auth.loggedadmin,couponController.couponList)
adrouter.get("/newcoupon",auth.loggedadmin,couponController.addCouponPage)
adrouter.post("/add_coupon",auth.loggedadmin,couponController.addCouponpost)
adrouter.get("/editCouponGet/:id",auth.loggedadmin,couponController.editcouponPage)
adrouter.post("/updateCoupon/:id",auth.loggedadmin,couponController.editCouponPost)
adrouter.get("/unlist/:id",auth.loggedadmin,couponController.unlistCoupon)
 


//==================================    BANNER PAGE  ================================================
adrouter.get('/bannerList',auth.loggedadmin,bannerController.bannerList);
adrouter.get('/addBanner',auth.loggedadmin,bannerController.addBanner);
adrouter.post('/addBanner',auth.loggedadmin,upload.single('image'),bannerController.addBannerpost)
adrouter.get('/deleteBanner/:id',auth.loggedadmin,bannerController.deleteBanner);
adrouter.get("/unlistBanner/:id",auth.loggedadmin,bannerController.bannerUnlist)
adrouter.get('/editBanner/:id',auth.loggedadmin,bannerController.editBanner);
adrouter.post('/updateBannerPost/:id',auth.loggedadmin, upload.single('newImage'),bannerController.updateBannerPost)

//====================================================SALES =======================================================
adrouter.post('/chartData',auth.loggedadmin,adminController.chartData);
adrouter.post('/downloadsales',auth.loggedadmin,adminController.downloadsales)


//====================================================LOGOUT =======================================================
//admin logout
adrouter.get('/adlogout', auth.logouting,adminController.adlogout)

//exports 
module.exports =adrouter;