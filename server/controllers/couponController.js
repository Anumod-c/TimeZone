const couponModel = require("../models/couponModel");
const {alphanumValid,uppercaseAlphanumValid,zerotonine,onlyNumbers,isFutureDate} = require("../../utils/validators/admin_vadlidators")



//=====================================     COUPON PAGE RENDERING          ======================================
const couponList = async (req,res)=>{
    try{
        const coupons = await couponModel.find()
        res.render("admin/couponList",{coupons})
    }
    catch(err){
        console.log("coupon list pagerendering error",err);
        res.render("user/serverError")  

    }
}

//==============================================   ADD COUPON  ==============================
const addCouponPage = async(req,res)=>{
    try{
        res.render("admin/addcoupon",{couponInfo:req.session.couponInfo,expressFlash:{
            codeError:req.flash("codeError"),
        minimumError:req.flash("minError"),
        discountError:req.flash("discountError"),
        expiryError:req.flash("expiryError"),
        maxError:req.flash("maxError"),
        typeError:req.flash("typeError"),
        existsError:req.flash("couponExistsError")
            }})
        req.session.couponInfo = null;
    }
    catch(err){
        console.log("adding coupon error",err);
        res.render("user/serverError")  

    }
}



//  ==============================================    ADD COUPON POST    =======================================
const addCouponpost = async(req,res)=>{
    try{
        const {couponCode,couponType,minimumPrice,discount,maxRedeem,expiry,} = req.body;
        const couponValid = uppercaseAlphanumValid(couponCode);
        const minimumValid = onlyNumbers(minimumPrice) 
        const discountValid = onlyNumbers(discount)
        const expiryValid= isFutureDate(expiry)
        const maxredeemValid = onlyNumbers(maxRedeem)
        const coupontypeValid = alphanumValid(couponType)

        req.session.couponInfo=req.body;

        if(!couponValid){
            req.flash("codeError","Only Uppercase letter Allowed")
          
            return res.redirect("/admin/newcoupon")
        }
        else if(!minimumValid){
            req.flash("minError","Invalid Data")
          
            return  res.redirect("/admin/newcoupon")

        }
        else if(!discountValid){
            req.flash("discountError","Invalid Data")
           
            return  res.redirect("/admin/newcoupon")

        }
        else if(!expiryValid){
            req.flash("expiryError","Invalid Data")
            
            return  res.redirect("/admin/newcoupon")

        }
        else if(!maxredeemValid){
            req.flash("maxError","Invalid Data")
          
            return  res.redirect("/admin/newcoupon")

        }
        

        const couponExist = await  couponModel.findOne({couponCode:couponCode});

        if(couponExist){
            req.flash("typeError","Coupon Already Exist")
            res.redirect("/admin/newcoupon")

        }
        else{
            req.session.couponInfo=null;
            await couponModel.create({
                couponCode: couponCode,
                type:couponType,
                minimumPrice:minimumPrice,
                discount:discount,
                maxRedeem:maxRedeem,
                expiry:expiry
            })
            res.redirect("/admin/couponList")
        }


        
    }
    catch(err){
        console.log("adding coupon error",err);
        res.render("user/serverError")  

    }
}

//================================== EDIT COUPON PAGE   ==============================

const editcouponPage = async(req,res)=>{
    try{
        const id= req.params.id;
        const coupon =await couponModel.findOne({_id:id});
         res.render("admin/editCouponPage",{coupon:coupon,expressFlash:{
            codeError:req.flash("codeError"),
            minimumError:req.flash("minError"),
            discountError:req.flash("discountError"),
            expiryError:req.flash("expiryError"),
            maxError:req.flash("maxError"),
            typeError:req.flash("typeError"),
            existsError:req.flash("couponExistsError")}})
    }
    catch(err){
        console.log("edit page rendering error",err);
        res.render("user/serverError")  

    }
}

//======================================     EDIT COUPON POST   ==============================


const editCouponPost = async (req,res)=>{
    try{
        const id = req.params.id;
        const currentCoupon = await couponModel.findOne({_id:id});

        const {couponCode,couponType,minimumPrice,discount,maxRedeem,expiry,} = req.body;
        const couponValid = uppercaseAlphanumValid(couponCode);
        const minimumValid = onlyNumbers(minimumPrice) 
        const discountValid = onlyNumbers(discount)
        const expiryValid= isFutureDate(expiry)
        const maxredeemValid = onlyNumbers(maxRedeem)
        const coupontypeValid = alphanumValid(couponType);


        if(!couponValid){
            req.flash("codeError","Only Uppercase letter Allowed")
            
            return res.redirect(`/admin/editCouponGet/${id}`)        }
        else if(!minimumValid){
            req.flash("minError","Invalid Data")
           
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!discountValid){
            req.flash("discountError","Invalid Data")
          
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!expiryValid){
            req.flash("expiryError","Invalid Data")
            
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!maxredeemValid){
            req.flash("maxError","Invalid Data")
           
            return res.redirect(`/admin/editCouponGet/${id}`)
        }

        const currCouponCode = currentCoupon.couponCode;

        const couponExists = await couponModel.findOne({
            $and: [
                { couponCode: couponCode }, // Your original condition
                { couponCode: { $ne: currCouponCode } } // Exclude current coupon
            ]
        });

        if (couponExists) {
            req.flash("couponExistsError","coupon code Exists")
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else{
            const updatedCoupon = await couponModel.updateOne({
                _id:id},
                {
                    $set: {
                        couponCode:couponCode,
                        type:couponType,
                        minimumPrice:minimumPrice,
                        discount:discount,
                        maxRedeem:maxRedeem,
                        expiry:expiry,
                    }
                }
                
            );
            
            res.redirect('/admin/couponList');
        }



    }
    catch(err){
        console.log("edit coupon post methor error",err);
        res.render("user/serverError")  

    }
}

//=======================================     UNLIST COUPON    ===================================

const unlistCoupon = async (req,res)=>{
    try{
        const id  = req.params.id;
        const coupon = await couponModel.findOne({_id:id});
        coupon.status = !coupon.status;
         await coupon.save();
        res.redirect("/admin/couponList")
    }
    catch(err){
        console.log("copon unlisting error",err);
        res.render("user/serverError")  

    }
}




module.exports={
    couponList,
    addCouponPage,
    addCouponpost,
    unlistCoupon,
    editcouponPage,
    editCouponPost,


}