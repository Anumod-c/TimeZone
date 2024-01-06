const express =require("express");
const usrouter =express.Router()
const userController=require('./../controllers/userController');
const prodcatviewController =require('../controllers/prodcatviewController');
const profileController = require('../controllers/profileController')
const cartController  =   require('../controllers/cartController')
const auth =require('../../middleware/isAuth')

usrouter.use(express.urlencoded({extended:true}))



//index page

usrouter.get('/',userController.index)

//registration
usrouter.get('/registration',auth.checkSessionVariable('signuppressed','/'),userController.registration)



//otp post
usrouter.post("/registration_otp",auth.iflogged,userController.signotp)

//otp page rendering
usrouter.get('/regotp',auth.checkSessionVariable('otppressed','/'),userController.otp)

//veryfying otp
usrouter.post('/verifyotp',auth.iflogged,userController.verifyotp)

//resend otp
usrouter.get('/resendotp',auth.iflogged,userController.resendotp)

//profile route
usrouter.get('/profile', userController.profile)

//login action
usrouter.post('/loginaction',userController.loginaction)





//forgot password
usrouter.get('/forgotpassword',auth.checkSessionVariable("forgotpressed","/profile"),userController.forgotpassword)

//forgotpassword post
usrouter.post('/forgotpasspost',userController.forgotpasspost)

//reset password
usrouter.get('/resetpassword',auth.checkSessionVariable("newpasspressed","/profile"),userController.resetpassword)
usrouter.post('/resetpasspost',userController.resetpasspost)





//=======================================procuct & category viewing section======================================
usrouter.get('/newarrival',prodcatviewController.newarrival)
usrouter.get('/pricehightolow',prodcatviewController.pricehightolow)


//========================CATEGORY SORTING AND SHOP PAGE RENDERING================================

usrouter.get('/shop',prodcatviewController.catagorysort)
usrouter.get('/singleproduct/:id',prodcatviewController.singleproduct)






//===================================    PROFILE   =============================================
usrouter.get('/userdetails',profileController.userdetials)
usrouter.get('/editprofile',profileController.editprofile)
usrouter.post('/updateprofile',profileController.updateprofile)
usrouter.get('/addnewaddress',profileController.addnewaddress)
usrouter.post('/saveAddress',profileController.addnewaddresspost)
usrouter.get('/editaddress/:addressId',profileController.editaddress)
usrouter.post('/updateAddress/:addressId',profileController.editaddresspost)
usrouter.get('/deleteAddress/:addressId',profileController.deleteaddress)
usrouter.get('/pswdmanagement',profileController.pswdmanagement)
usrouter.post('/changepassword',profileController.pswdmanagementpost)



//=================================     CART    =======================================
usrouter.get('/cart',cartController.showcart)
usrouter.get('/addtocart/:id',cartController.addToCart)
usrouter.post('/update-cart-quantity/:productId', cartController.updatecart);
usrouter.get('/deletecart/:id',cartController.deletecart)







//===================================
usrouter.get('/logout',auth.islogged,userController.logout)




//exporting
module.exports=usrouter