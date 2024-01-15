const categoryModel = require("../models/categorymodel");
const userModel = require("../models/usermodel");
const productModel = require("../models/productmodel");
const flash = require("express-flash")
const orderModel = require("../models/ordermodel");
const bcrypt = require("bcrypt");
const {
  nameValid,
  lnameValid,
  emailValid,
  phoneValid,
  passwordValid,
  confirmpasswordValid,
} = require("../../utils/validators/usersignupvalidator");

const {bnameValid,adphoneValid,pincodeValid} = require("../../utils/validators/address_Validators")

//================================ USER DETAILS PAGE RENDERING   ===================================
const userdetials = async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await categoryModel.find();
    const userData = await userModel.findOne({ _id: userId });
    res.render("user/userdetails", {
      categories: categories,
      userData: userData,
    });
  } catch (err) {
    console.log("userdetailserror", err);
  }
};
//==================================== EDIT PROFILE GET =============================================
const editprofile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await categoryModel.find();
    const userData = await userModel.findOne({ _id: userId });
    res.render("user/editprofile", {
      categories: categories,
      userData: userData,
    });
  } catch (err) {
    console.log("edit profile error", err);
  }
};
//=================================== EDIT PROFILE POST =======================================
const updateprofile = async (req, res) => {
  try {
    const { firstname, lastname, email, gender, age, phone } = req.body;
    console.log(firstname, lastname, email, age, phone, gender);
    const userId = req.session.userId;
    const data = await userModel.updateOne(
      { _id: userId },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
          phone: phone,
          age: age,
          gender: gender,
        },
      }
    );
    console.log(data, "updated details");
    res.redirect("/userdetails");
  } catch (err) {
    console.log("profile post error");
  }
};

//========================================ADD NEW ADDRESS PAGE ================================================
const addnewaddress =async(req,res)=>{
  try{
      const categories=await categoryModel.find();
      res.render('user/newAddress',{categories:categories,expressFlash:{
        fullnameerror: req.flash("fullnameerror"),
        saveaserror: req.flash("saveaserror"),
        adnameerror: req.flash("adnameerror"),
        streeterror: req.flash("streeterror"),
        pincodeerror: req.flash("pincodeerror"),
        cityerror: req.flash("cityerror"),
        stateerror: req.flash("stateerror"),
        countryerror: req.flash("countryerror"),
        phoneerror: req.flash("phoneerror"),
        addressexsitserror:req.flash("addressexsitserror")
      }})
  }
  catch(err){
      console.log('add new address page rendering error',err);
  }
}
//================================================NEW ADDRESS POST   =============================
const addnewaddresspost =async(req,res)=>{
  try{
    const categories=await categoryModel.find();
      const {saveas,fullname,adname,street,city,state,pincode,country,phonenumber} =req.body;
      const userId =req.session.userId;
      console.log('user_id',userId);
      const existingUser =await userModel.findOne({_id:userId});
      console.log(existingUser,"tueeeeeeeeeeeeeee");
      const fullnamevalid=bnameValid(fullname)//
      const saveasvalid=bnameValid(saveas)//
      const adnameValid=bnameValid(adname)//
      const streetValid=bnameValid(street)
      const pinvalid=pincodeValid(pincode)
      const cityValid=bnameValid(city)
      const stateValid=bnameValid(state)
      const countryValid=bnameValid(country)
      const phoneValid=adphoneValid(phonenumber)


      if(!fullnamevalid){
        console.log("fullname valid");
        req.flash("fullnameerror","Enter a Valid name");
        return res.redirect("/addnewaddress")
      }
      if(!saveasvalid){
        console.log("svaes valid");
        req.flash("saveaserror","Enter a Valid Address Type");
        return res.redirect("/addnewaddress")
      }
      if(!adnameValid){
        console.log("adname valid");
        req.flash("adnameerror","Enter a Valid Name");
        return res.redirect("/addnewaddress")
      }
      if(!streetValid){
        console.log("street valid");
        req.flash("streeterror","Enter a Valid Street");
        return res.redirect("/addnewaddress")
      }
      if(!pinvalid){
        console.log("pin valid");
        req.flash("pincodeerror","Enter a Valid Pin");
        return res.redirect("/addnewaddress")
      }
      if(!cityValid){
        console.log("city valid");
        req.flash("cityerror","Enter a Valid City");
        return res.redirect("/addnewaddress")
      }
      if(!stateValid){
        console.log("state valid");
        req.flash("stateerror","Enter a Valid State");
        return res.redirect("/addnewaddress")
      }
      if(!countryValid){
        console.log("contruy valid");
        req.flash("countryerror","Enter a Valid Country");
        return res.redirect("/addnewaddress")
      }
      if(!phoneValid){
        console.log("phone valid");
        req.flash("phoneerror","Enter a Valid Phone");
        return res.redirect("/addnewaddress")
      }

      if(existingUser){
        console.log("exsirt user if worked valid");
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
                      phonenumber:phonenumber
                  }
              }
          });
          if(existingAddress){
            console.log("exist adress if worked valid");
            req.flash("addressexsitserror","Address Alredy Exist");

            return res.redirect("/addnewaddress")
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
              phonenumber:phonenumber,
          });
          await existingUser.save();
          

      }
       res.redirect('/userdetails')
              
  }
  catch(err){
      console.log('add new address post method error',err);
  }
}
//=================================   EDIT ADDRESS ==================================
const editaddress = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const userData = await userModel.findById({ _id: userId });
    const address = userData.address.id(addressId);

    res.render("user/editAddress.ejs", {
      categories: categories,
      address: address,
    });
  } catch (err) {
    console.log("edit adress error:", err);
  }
};
//==================================  EDIT ADDRESS POST ==========================
const editaddresspost = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phonenumber,
    } = req.body;

    
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const isAddressExists = await userModel.findOne({
      _id: userId,
      address: {
        $elemMatch: {
          _id: { $ne: addressId },
          saveas: saveas,
          fullname: fullname,
          adname: adname,
          street: street,
          pincode: pincode,
          city: city,
          state: state,
          country: country,
          phonenumber: phonenumber,
        },
      },
    });
    console.log("address exist workd",isAddressExists);
    
    



       await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.saveas": saveas,
          "address.$.fullname": fullname,
          "address.$.adname": adname,
          "address.$.street": street,
          "address.$.pincode": pincode,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.country": country,
          "address.$.phonenumber": phonenumber,
        },
      }
    );
    res.redirect("/userdetails");
  } catch (err) {
    res.status(500).send("Error Occured");
    console.log("edit address post error", err);
  }
};
//=================================   DELETE ADDRESS ===================================
const deleteaddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const data = await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      { $pull: { address: { _id: addressId } } }
    );
    console.log("the data i rendered", data);
    res.redirect("/userdetails");
  } catch (err) {
    console.log("delete address error", err);
  }
};
//========================================= PASSWORD MANAGEMENT   ======================================
const pswdmanagement = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.render("user/changePassword", { categories: categories });
  } catch (err) {
    console.log("pswdmanagement error", err);
  }
};

//=====================================   PASSWORD MANAGEMENT POST ===============================
const pswdmanagementpost = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const userId =req.session.userId
    const oldpassword = req.body.oldPassword;
    const newpassword = req.body.newPassword;
    const confirmpassword = req.body.confirmPassword;
    const user = await userModel.findById(userId);
    const isPasswordValid =passwordValid(newpassword);
    const isCPasswordValid = confirmpasswordValid(confirmpassword,newpassword)
    
    const passwordMatch =await bcrypt.compare(oldpassword,user.password);
    
    if(passwordMatch){
        console.log('gggggggggggggg',oldpassword,user.password);
        if(!isPasswordValid){
            res.render('user/changePassword',{perror:"Passsword should contain atleast one Uppercase, Lowercase, Digit, Special character",categories:categories})
        }
        else if(!isCPasswordValid){
            res.render('user/changePassword',{cpasserror:'Password not match',categories:categories});
        }
        else{
            const hashedpassword = await bcrypt.hash(newpassword,10);
            await userModel.updateOne({_id:userId},{password:hashedpassword});
            res.redirect('/userdetails')
        }
    }
    else{
        res.render('user/changePassword',{categories:categories,olderror:'Incorrect Old Password'})
    }
  } catch (err) {
    res.status(500).send("error occured");
    console.log("post error in changin passsword from profile", err);
  }
};
//======================================== ORDER HISTORY ===============================

const orderHistory = async (req, res) => {
  try {
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
  } catch (err) {
    console.log("order history error", err);
  }
};

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
///==============================Wallet============================
const wallet = async(req,res)=>{
  const categories = await categoryModel.find();
  try{
    res.render("user/wallet",{categories:categories})
  }
  catch(err){
    console.log("wallet error,err");
  }
}

module.exports = {
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
  wallet,
};
