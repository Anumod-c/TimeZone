const couponModel = require("../models/couponModel");
const {alphanumValid,uppercaseAlphanumValid,zerotonine,onlyNumbers,isFutureDate} = require("../../utils/validators/admin_vadlidators")



//=====================================     COUPON PAGE RENDERING          ======================================
const couponList = async (req,res)=>{
    try{
        const coupons = await couponModel.find({status:true})
        res.render("admin/couponList",{coupons})
    }
    catch(err){
        console.log("coupon list pagerendering error",err);
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
            console.log("11111COPON VLA11111111111");
            return res.redirect("/admin/newcoupon")
        }
        else if(!minimumValid){
            req.flash("minError","Invalid Data")
            console.log("11111111MINIM,UM11111111");
            return  res.redirect("/admin/newcoupon")

        }
        else if(!discountValid){
            req.flash("discountError","Invalid Data")
            console.log("11111111DISCOPUNT11111111");
            return  res.redirect("/admin/newcoupon")

        }
        else if(!expiryValid){
            req.flash("expiryError","Invalid Data")
            console.log("11111111EXPIRY11111111");
            return  res.redirect("/admin/newcoupon")

        }
        else if(!maxredeemValid){
            req.flash("maxError","Invalid Data")
            console.log("MAX REDEEM");
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
            console.log("11111COPON VLA11111111111");
            return res.redirect(`/admin/editCouponGet/${id}`)        }
        else if(!minimumValid){
            req.flash("minError","Invalid Data")
            console.log("11111111MINIM,UM11111111");
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!discountValid){
            req.flash("discountError","Invalid Data")
            console.log("11111111DISCOPUNT11111111");
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!expiryValid){
            req.flash("expiryError","Invalid Data")
            console.log("11111111EXPIRY11111111");
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!maxredeemValid){
            req.flash("maxError","Invalid Data")
            console.log("MAX REDEEM");
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
            console.log("COUPON created");
            res.redirect('/admin/couponList');
        }



    }
    catch(err){
        console.log("edit coupon post methor error",err);
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