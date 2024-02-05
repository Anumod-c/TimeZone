const express =require("express");
const usrouter =express.Router()
const userController=require('./../controllers/userController');
const prodcatviewController =require('../controllers/prodcatviewController');
const profileController = require('../controllers/profileController')
const cartController  =   require('../controllers/cartController')
const checkoutController =require('../controllers/checkoutController')
const ratingController = require("../controllers/ratingController")
const bannerController = require("../controllers/bannerController")
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

usrouter.get('/pricelowtohigh',prodcatviewController.pricelowtohigh)


usrouter.post("/search",prodcatviewController.search)


usrouter.get("/bannerURL",  bannerController.bannerURL)
//========================CATEGORY SORTING AND SHOP PAGE RENDERING================================

usrouter.get('/shop',prodcatviewController.catagorysort)
usrouter.get('/singleproduct/:id',prodcatviewController.singleproduct)






//===================================    PROFILE   =============================================
usrouter.get('/userdetails',auth.islogged, profileController.userdetials)
usrouter.get('/editprofile',auth.islogged,profileController.editprofile)
usrouter.post('/updateprofile',auth.islogged,profileController.updateprofile)
usrouter.get('/addnewaddress',auth.islogged,profileController.addnewaddress)
usrouter.post('/saveAddress',auth.islogged,profileController.addnewaddresspost)
usrouter.get('/editaddress/:addressId',auth.islogged,profileController.editaddress)
usrouter.post('/updateAddress/:addressId',auth.islogged,profileController.editaddresspost)
usrouter.get('/deleteAddress/:addressId',auth.islogged,profileController.deleteaddress)
usrouter.get('/pswdmanagement',auth.islogged,profileController.pswdmanagement)
usrouter.post('/changepassword',auth.islogged,profileController.pswdmanagementpost)
usrouter.get('/orderHistory',auth.islogged,profileController.orderHistory)
usrouter.get("/cancelorder/:id",auth.islogged,profileController.orderCancelling)
usrouter.get("/returnorder/:id",auth.islogged,profileController.orderreturning)
usrouter.get("/returnitem/:id/:orderId",auth.islogged,profileController.itemreturintg)
usrouter.get('/cancelitem/:id/:orderId',auth.islogged,profileController.itemCancelling)
usrouter.get('/singleOrder/:id',auth.islogged,profileController.singleOrderPage)
usrouter.get("/wallet",auth.islogged,profileController.wallet)
usrouter.post("/walletTopup",auth.islogged,profileController.wallettopup)
usrouter.post('/walletcreate/orderId',auth.islogged,profileController.walletUpi)
usrouter.get("/rewards",auth.islogged,profileController.couponsAndRewards)
usrouter.get("/ratepage",ratingController.ratepage)
usrouter.get("/download-invoice/:orderId",auth.islogged,profileController.downloadinvoice)


//=================================     CART    =======================================
usrouter.get('/cart',auth.islogged,cartController.showcart)
usrouter.get('/addtocart/:id',auth.islogged,cartController.addToCart)
usrouter.post('/update-cart-quantity/:productId',auth.islogged, cartController.updatecart);
usrouter.get('/deletecart/:id',auth.islogged,cartController.deletecart)


//=================================     Wishlist    =======================================
usrouter.get('/favourite',auth.islogged,cartController.favouritepage)
usrouter.get('/addtofavourite/:id',auth.islogged,cartController.addToFav)
usrouter.get('/deletefav/:id',auth.islogged,cartController.deleteFav)
usrouter.get('/addtocartviafav/:id',auth.islogged,cartController.addtocartviafav)


//============================ CHECKOUtPAGE ==================
usrouter.get('/checkoutpage',cartController.checkoutpage)

usrouter.post('/checkoutreload',auth.islogged,checkoutController.checkoutrelod)


usrouter.post('/placeOrder',auth.islogged,checkoutController.placeOrder);

usrouter.post('/create/orderId',auth.islogged,checkoutController.upi)
usrouter.post("/wallettransaction",auth.islogged,checkoutController.wallettransaction)

usrouter.post("/applyCoupon",auth.islogged,checkoutController.applyCoupon)
usrouter.post("/revokeCoupon",auth.islogged,checkoutController.revokeCoupon)




//===================================
usrouter.get('/logout',auth.islogged,userController.logout)




//exporting
module.exports=usrouter