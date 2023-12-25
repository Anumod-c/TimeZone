const categoryModel = require('../models/categorymodel');
const userModel = require('../models/usermodel');
const productModel = require('../models/productmodel');

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
        const {fullname,addressLine1,addressLine2,city,state,zipCode,country} =req.body;
        const userId =req.session.userId;
        

    }
    catch(err){
        console.log('add new address post method error',err);
    }
 }
module.exports={
    userdetials,
    editprofile,
    updateprofile,
    addnewaddress,
    addnewaddresspost



}