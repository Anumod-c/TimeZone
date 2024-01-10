const categoryModel = require('../models/categorymodel');
const userModel = require('../models/usermodel');
const productModel = require('../models/productmodel');
const orderModel =require('../models/ordermodel')
const bcrypt=require('bcrypt')
const {nameValid,
    lnameValid, 
    emailValid,phoneValid,
    passwordValid,
    confirmpasswordValid}=require('../../utils/validators/usersignupvalidator')


//================================ USER DETAILS PAGE RENDERING   ===================================
const userdetials =async(req,res)=>{
    try {
        const userId=req.session.userId
        const categories =await categoryModel.find();
        const userData =await userModel.findOne({_id:userId})
        res.render('user/userdetails',{categories:categories,userData:userData})   
    }
    catch(err){
        console.log('userdetailserror',err);
    }
}
//==================================== EDIT PROFILE GET =============================================
const editprofile =async (req,res)=>{
    try{
        const userId=req.session.userId
        const categories =await categoryModel.find();
        const userData =await userModel.findOne({_id:userId})
        res.render('user/editprofile',{categories:categories,userData:userData})   

    }
    catch(err){
        console.log('edit profile error',err);
    }
}
//=================================== EDIT PROFILE POST =======================================
const updateprofile =async(req,res)=>{
    try{
         const {firstname,lastname,email,gender,age,phone} =req.body;
         console.log(firstname,lastname,email,age,phone,gender);
         const userId = req.session.userId;
         const data =await userModel.updateOne({_id:userId},{$set:{firstname:firstname,lastname:lastname,phone:phone,age:age,gender:gender}})
         console.log(data,'updated details');
         res.redirect('/userdetails')
    }
    catch(err){
        console.log('profile post error');
    }
}

//========================================ADD NEW ADDRESS PAGE ================================================
const addnewaddress =async(req,res)=>{
    try{
        const categories=await categoryModel.find();
        res.render('user/newAddress',{categories:categories})
    }
    catch(err){
        console.log('add new address page rendering error',err);
    }
}
//================================================NEW ADDRESS POST   =============================
 const addnewaddresspost =async(req,res)=>{
    try{
        const {saveas,fullname,adname,street,city,state,pincode,country,phone} =req.body;
        const userId =req.session.userId;
        console.log('user_id',userId);
        const existingUser =await userModel.findOne({_id:userId});
        if(existingUser){
            const existingAddress =await userModel.findOne({
                _id:userId,address:{
                    $elemMatch :{
                        fullname:fullname,
                        adname:adname,
                        street:street,
                        pincode:pincode,
                        city:city,
                        state:state,
                        country:country,
                        phonenumber:phone
                    }
                }
            });
            if(existingAddress){
                 return res.redirect('/addAddress')
            }
            existingUser.address.push({
                saveas:saveas,
                fullname:fullname,
                adname:adname,
                street:street,
                pincode:pincode,
                city:city,
                state:state,
                country:country,
                phonenumber:phone,
            });
            await existingUser.save();
            return res.redirect('/userdetails')

        }
        const newAddress =await userModel.create({
            userId:userId,
            address:{
                saveas:saveas,
                fullname:fullname,
                adname:adname,
                street:street,
                pincode:pincode,
                city:city,
                state:state,
                country:country,
                phonenumber:phone

            },
        });
        console.log(newAddress);
        res.redirect('/userdetails');        
    }
    catch(err){
        console.log('add new address post method error',err);
    }
 }
 //=================================   EDIT ADDRESS ==================================
 const editaddress =async(req,res)=>{
    try{
        const categories= await categoryModel.find();
        const addressId =req.params.addressId;
        const userId=req.session.userId;
        const userData = await userModel.findById({ _id: userId });
        const address = userData.address.id(addressId);

        res.render('user/editAddress.ejs',{categories:categories,address:address})

    }
    catch(err){
        console.log('edit adress error:',err);
    }
 }
 //==================================  EDIT ADDRESS POST ==========================
 const editaddresspost =async (req,res)=>{
    try{
        const {saveas,fullname,adname,street,pincode,city,state,country,phone}= req.body;
        const addressId =req.params.addressId;
        const userId =req.session.userId;
        const isAddressExists = await userModel.findOne({
            '_id': userId,
            'address': {
                $elemMatch: {
                    '_id': { $ne: addressId }, 
                    'saveas': saveas,
                    'fullname': fullname,
                    'adname': adname,
                    'street': street,
                    'pincode': pincode,
                    'city': city,
                    'state': state,
                    'country': country,
                    'phonenumber': phone
                }
            }
        });

        if(isAddressExists){
            return res.status(400).send('address alredy exist');
        }

        const result = await userModel.updateOne(
            { '_id': userId, 'address._id': addressId },
            {
                $set: {
                    'address.$.saveas': saveas,
                    'address.$.fullname': fullname,
                    'address.$.adname': adname,
                    'address.$.street': street,
                    'address.$.pincode': pincode,
                    'address.$.city': city,
                    'address.$.state': state,
                    'address.$.country': country,
                    'address.$.phonenumber': phone
                }
            }
        );
        res.redirect('/userdetails');
    }
    catch(err){
        res.status(500).send('Error Occured')
        console.log('edit address post error',err)
    }
 }
 //=================================   DELETE ADDRESS ===================================
 const deleteaddress  = async(req,res)=>{
    try{
        const addressId =req.params.addressId;
        const userId =req.session.userId;
        const data =await userModel.updateOne({_id:userId,"address._id":addressId},{$pull:{ address:{_id:addressId}}});
        console.log('the data i rendered',data)
        res.redirect('/userdetails')
    }
    catch(err){
        console.log('delete address error',err);
    }
 }
 //========================================= PASSWORD MANAGEMENT   ======================================
 const pswdmanagement = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.render('user/changePassword', { categories: categories });
    } catch (err) {
        console.log('pswdmanagement error', err);
    }
}

  //=====================================   PASSWORD MANAGEMENT POST ===============================
  const pswdmanagementpost =async (req,res)=>{
    try{
        console.log('pswdmanagementpost reached')
        const password=req.body.newPassword;
        const cpassword =req.body.confirmPassword;
        console.log(password,cpassword,'both passwords');
        const ispasswordValid = passwordValid(password)
        const iscpasswordValid = confirmpasswordValid(cpassword, password)
        if (!ispasswordValid) {
            res.render('user/changePassword', { perror: "Password should contain one uppercase,one lowercase,one number,one special charecter" })
        }
        else if (!iscpasswordValid) {
            res.render('user/changePassword', { cperror: "Password and Confirm password should be match" })
        }
        else{
            const hashedpassword = await bcrypt.hash(password, 10)
            const userId = req.session.userId;
            await userModel.updateOne({_id:userId},{password:hashedpassword})
            res.redirect('/userdetails')
        }

    }
    catch(err){
        res.status(500).send('error occured')
        console.log('post error in changin passsword from profile',err);
    }
  }
 //======================================== ORDER HISTORY ===============================


const orderHistory = async(req,res)=>{
    try{
        const userId = req.session.userId;
    console.log(userId);
    const categories = await categoryModel.find();
    const od = await orderModel.find({ userId: userId });
    const allOrderItems = [];
    od.forEach((order) => {
      allOrderItems.push(...order.items);
    });
    const orders = await orderModel.aggregate([
        {
          $match: {
            userId: userId,
          },
        },
        {
          $sort: {
            createdAt: -1, // Sort in ascending order (use -1 for descending order)
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
      ]);
      const updatedOrders = orders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          productDetails: order.productDetails.find(
            (product) => product._id.toString() === item.productId.toString()
          ),
        })),
      }));
  
      res.render("user/order_history", {
        od,
        orders: updatedOrders,
        categories,
        allOrderItems,
      });



    }
    
    catch(err){
        console.log('order history error',err);
    }
}




const singleOrderPage = async (req, res) => {
    try {
      const id = req.params.id;
  
      const order = await orderModel.findOne({ _id: id });
      const categories = await categoryModel.find();
      res.render("user/orderDetails", { categories, order });
    } catch (err) {
      console.log(err);
        
    }
  };




module.exports={
    userdetials,
    editprofile,
    updateprofile,
    addnewaddress,
    editaddress,
    addnewaddresspost,
    deleteaddress,
    editaddresspost,
    pswdmanagement,
    pswdmanagementpost,
    orderHistory,
    singleOrderPage,








}