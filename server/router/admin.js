const express =require('express')
const adrouter =express.Router();
const adminController =require('./../controllers/adminController');
const productController =require('../controllers/productcontroller')
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




//====================================================LOGOUT =======================================================
//admin logout
adrouter.get('/adlogout', auth.logouting,adminController.adlogout)

//exports 
module.exports =adrouter;