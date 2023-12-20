const express =require('express')
const adrouter =express.Router();
const adminController =require('./../controllers/adminController');
const productController =require('../controllers/productcontroller')
adrouter.use(express.urlencoded({extended:true}));
const multer =require('multer');
const upload=multer({dest:'uploads/'})  



//admin login page
adrouter.get("/",adminController.adlogin)


//admin loginpost
adrouter.post('/adloginpost',adminController.adloginpost)

//admin home
adrouter.get('/adminpannel',adminController.adminpannel)

//userlist
adrouter.get('/userslist',adminController.userlist)

//update user
adrouter.get('/update/:email',adminController.userupdate)

//search user
adrouter.post('/searchuser',adminController.searchuser)

//view user
adrouter.get('/searchview',adminController.searchview)

//filter
adrouter.get('/filter/:options',adminController.filter)

//============================================= CATOGORIES============================================


adrouter.get('/Category',adminController.category)

adrouter.get('/newcat',adminController.newcat)

adrouter.post('/add-category',adminController.addcategory)

adrouter.get('/updatecat/:id',adminController.updatecat)

adrouter.post('/update-category/:id',adminController.updatecatpost)

adrouter.get('/unlistcat/:id',adminController.unlistcat)



//============================================PRODUCT====================================================
adrouter.get('/product',productController.product)
adrouter.get('/newproduct',productController.newproduct)
adrouter.post('/addproduct',upload.array('images'),productController.addproduct)

adrouter.get('/unlist/:id',productController.unlist)
adrouter.get('/updateproduct/:id',productController.updateproduct)
adrouter.get('/editimage/:id',productController.editimage)
adrouter.get('/delimage',productController.delimage)
adrouter.post('/editimagepost/:id',upload.array('images'),productController.editimagepost)
adrouter.post('/updateproductpost/:id',productController.updateproductpost)
adrouter.post('/deleteproduct/:id',productController.delproduct)




//====================================================LOGOUT =======================================================
//admin logout
adrouter.get('/adlogout', adminController.adlogout)

//exports 
module.exports =adrouter;