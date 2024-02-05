const bannerModel = require("../models/bannerModel");
const categoryModel = require("../models/categorymodel");
const couponModel = require("../models/couponModel");
const productModel = require("../models/productmodel");
const usermodel = require("../models/usermodel");
const mongoose = require('mongoose')
const {
  onlyNumbers,
  alphanumValid,
  zerotonine,
} = require("../../utils/validators/admin_vadlidators");
const { product } = require("./productcontroller");

//====================================== BANNER LISTING  ==========================================

const bannerList = async (req, res) => {
  try {
    const banners = await bannerModel.find();
    res.render("admin/banner", { banners: banners });
  } catch (err) {
    console.log("banner page loading errror", err);
    res.render("user/serverError")  

  }
};

//================================   ADD BANNER  ================================================

const addBanner = async (req, res) => {
  try {
    const coupons = await couponModel.find();
    const products = await productModel.find();
    const categories = await categoryModel.find();

    res.render("admin/addBanner", {
      categories,
      products,
      coupons,
      expressFlash: {
        titleError: req.flash("titleError"),
        subtitleError: req.flash("subtitleError"),
      },
    });
  } catch (err) {
    console.log("adding banner error", err);
    res.render("user/serverError")  

  }
};

//===================================  ADD BANNER POST   ===============================
const addBannerpost = async (req, res) => {
  try {
    const { bannerLabel, bannerTitle, bannerSubtitle, bannerColor } = req.body;
    const tittleValid = alphanumValid(bannerTitle);
    const subtitleValid = alphanumValid(bannerSubtitle);
    if (!tittleValid) {
      
      req.flash("titleError", "Invalid Entrty");
      return res.redirect("/admin/addBanner");
    }
    if (!subtitleValid) {
      
      req.flash("subtitleError", "Invalid Entry");
      return res.redirect("/admin/addBanner");
    }

    let bannerLink;
    if (bannerLabel == "category") {
      bannerLink = req.body.category;
    } else if (bannerLabel == "product") {
      bannerLink = req.body.product;
    } else if (bannerLabel == "coupon") {
      bannerLink = req.body.coupon;
    } else {
      bannerLink = "general";
    }

    const newBanner = new bannerModel({
      label: bannerLabel,

      title: bannerTitle,

      subtitle: bannerSubtitle,

      image: {
        public_id: req.file.filename,
        url: `/uploads/${req.file.filename}`,
      },

      color: bannerColor,
      bannerlink: bannerLink,
    });
    await newBanner.save();
    const banners = await bannerModel.find();
    res.render("admin/banner", { banners: banners });
  } catch (err) {
    console.log("bannerpost methood error", err);
    res.render("user/serverError")  

  }
};

//=========================================  EDIT BANNER  ==========================================
const editBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await bannerModel.findOne({ _id: bannerId });
    const products = await productModel.find();
    const coupons = await couponModel.find();
    const categories = await categoryModel.find();
    res.render("admin/editBanner",{ banner, products, categories,coupons, 
      expressFlash: {
        titleError: req.flash("titleError"),
        subtitleError: req.flash("subtitleError"),
      },
    });
  } catch (err) {
    console.log("edit banner error", err);
    res.render("user/serverError")  

  }
};

//=========================================  EDIT BANNER POST  ==========================================

const updateBannerPost = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const { bannerLabel, bannerTitle, bannerSubtitle } = req.body;
    const banner = await bannerModel.findOne({ _id: bannerId });
    const subtitleValid = alphanumValid(bannerSubtitle);

    const titleValid = alphanumValid(bannerTitle);
    if (!titleValid) {
     
      req.flash("titleError", "Invalid Entry !");
      return res.redirect(`/admin/editBanner/${bannerId}`);
    }
    if (!subtitleValid) {
       

      req.flash("subtitleError", "Invalid Entry !");
      return res.redirect(`/admin/editBanner/${bannerId}`);
    }

    let bannerLink;
    if (bannerLabel == "category") {
      bannerLink = req.body.category;
    } else if (bannerLabel == "product") {
      bannerLink = req.body.product;
    } else if (bannerLabel == "coupon") {
      bannerLink = req.body.coupon;
    } else {
      bannerLink = "general";
    }

    banner.bannerlink = bannerLink;
    banner.label = bannerLabel;
    banner.title = bannerTitle;
    banner.subtitle = bannerSubtitle;
    banner.color = req.body.bannerColor;
    if (req.file) {
        banner.image = {
        public_id: req.file.filename, 
        url: `/uploads/${req.file.filename}` 
    }
}
    await banner.save();
    
    res.redirect('/admin/bannerList')
  } catch (err) {
    console.log("edit banner post error", err);
    res.render("user/serverError")  

  }
};

//======================================= LIST & UNLIST  ======================================
const bannerUnlist = async(req,res)=>{
  try{
    const bannerId = req.params.id;
    const banner = await bannerModel.findOne({_id:bannerId});
    banner.active = !banner.active;
    await banner.save();
    res.redirect("/admin/bannerList")
  }
  catch(err){
    console.log("unlisting banner error");
    res.render("user/serverError")  

  }
}

//=======================================  DELETE BANNER   ==================================

const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const deletedBanner = await bannerModel.findByIdAndDelete(bannerId);
    res.redirect("/admin/bannerList");
  } catch (err) {
    console.log("delete banner error", err);
    res.render("user/serverError")  

  }
};

//==================================     BANNER CLICKING URL      =====================

const bannerURL = async (req,res)=>{
  try{
 const bannerId = req.query.id;
 const banner = await bannerModel.findOne({_id:bannerId});
 if(banner.label=="category"){
  const categoryId = banner.bannerlink;
 

  const category = await categoryModel.findOne({_id:categoryId})
  
  res.redirect(`/shop?category=${categoryId}`)
 }
 else if(banner.label=="product"){
  const productId=banner.bannerlink
  
  const  product=await productModel.findOne({_id: productId})

  res.redirect(`/singleproduct/${productId}`)

}
else if(banner.label=="coupon"){
  if(req.session.userId){
    res.redirect("/rewards")

  }
  else{
    res.redirect("/profile")
  }
  // const couponId=new mongoose.Types.ObjectId(banner.bannerlink)
  // const  coupon=await couponModel.find({_id: couponId})

}
else{
  res.redirect("/")
}


  }
  catch(err){
    console.log("banner clicking error",err);
    res.render("user/serverError")  

  }
}

//===================================================================================================

module.exports = {
  bannerList,
  addBanner,
  addBannerpost,
  deleteBanner,
  editBanner,
  updateBannerPost,
  bannerUnlist,
  bannerURL,
};
