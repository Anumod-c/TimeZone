const mongoose =require("mongoose")
const userModel =require('../models/usermodel')
const bcrypt=require('bcrypt')
const flash = require("express-flash")
const otpgenerator=require('otp-generator')
const nodemailer=require('nodemailer');
const ShortUniqueId = require("short-unique-id");
const uniqueid = new ShortUniqueId({ length: 10 });
const {nameValid,
    lnameValid, 
    emailValid,phoneValid,
    passwordValid,
    confirmpasswordValid}=require('../../utils/validators/usersignupvalidator')
const otpModel = require('../models/userotpmodel')
const categoryModel = require('../models/categorymodel')
const productModel = require('../models/productmodel');
const walletModel = require('../models/walletModel');
const bannerModel = require("../models/bannerModel")
const Email=process.env.Email
const pass=process.env.pass


//=====================================    otp generating function   ===============================================
const generatorotp =()=>{
    const otp=otpgenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
        digits:true,
    });
    console.log("Generated otp:",otp)
    return otp
    
}
//=====================================     otp email sending funtion    ======================================
const sendmail=async(email,otp)=>{
    try{
        var transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:Email,
                pass:pass
            },
        });
        var mailOptions ={
            //ulwu qkzq zzgb cfye
            from :"timeZone<timezoneofficial18@gmail.com>",
            to:email,
            subject:"E-Mail Verifications",
            text:"Your OTP is " + otp,
        };

        await transporter.sendMail(mailOptions);
    }
    catch (err){
        console.log("error in sending email",err)
    }
}


//=====================================     home page rendering     ============================================ 
const index=async(req,res)=>{
try{
    const categories= await categoryModel.find({status:true});
    const products=await productModel.find({status:true}).sort({_id:-1}).limit(6)
    const banners = await bannerModel.find( {active:true});
    
    res.render('user/index',{categories:categories,products:products,banners:banners})
}
catch(err){
console.log(err,"homepage error");
res.render("user/serverError")  

}}


//==================================        user signup   =========================================================
const registration =async(req,res)=>{
    req.session.otppressed=true;
    await res.render("user/registration",{
        expressFlash:{
            emailexisterror:req.flash("emailexisterror"),
            fnameerror:req.flash("fnameerror"),
            lnameerror:req.flash("lnameerror"),
            emailerror:req.flash("emailerror"),
            phoneerror:req.flash("phoneerror"),
            passworderror:req.flash("passworderror"),
            cpassworderror:req.flash("cpassworderror"),
        }
    })
}

//======================================    user otp sending    =================================================
const signotp = async(req,res)=>{
    try{       
        let firstname=req.body.firstname;
        let lastname=req.body.lastname;
         let email=req.body.email;
        let phone=req.body.phone;
        let password=req.body.password;
        let cpassword=req.body.cpassword;
        
        if(req.body.referal){
            req.session.referal = req.body.referal;
        }
        



        const isFnameValid=nameValid(firstname);
        const isLnameValid =lnameValid(lastname);
        const isEmailValid =emailValid(email);
        const isPhoneValid =phoneValid(phone)
        const isPasswordValid =passwordValid(password);
        const isCPasswordValid =confirmpasswordValid(cpassword,password)

        const emailExist =await userModel.findOne({email:email})
        if(emailExist){
              req.flash('emailexisterror',"E-Mail already exist")
               res.redirect("/registration")
        }
        else if(!isFnameValid){
            req.flash('fnameerror',"Enter a Valid Name")
            res.redirect("/registration")
        }
        else if(!isLnameValid){
            req.flash('lnameerror',"Enter a Valid Name");
            res.redirect("/registration")
        }
        
        else if(!isEmailValid){
            req.flash('emailerror',"Enter a Valid Email");
            res.redirect("/registration")
        }
        else if(!isPhoneValid){
            req.flash('phoneerror',"Enter a Valid Phone Number");
            res.redirect("/registration")
        }
        else if(!isPasswordValid){
            req.flash('passworderror',"Enter a Valid Password");
            res.redirect("/registration")
        }
        else if(!isCPasswordValid){
            req.flash('cpassworderror',"Enter a Valid Password");
            res.redirect("/registration")
        }
        else{
            const hashedpassword=await bcrypt.hash(password,10);
            const user =new userModel({
                firstname:firstname,
                lastname:lastname,
                email:email,
                phone:phone,
                password:hashedpassword,
                uniqueID: uniqueid.rnd()
            });
            
            req.session.user = user;
            req.session.signup = true;
            req.session.forgot = false;
            
            const otp = generatorotp();
            console.log(otp,"otp function evoked")
            const currentTimestamp =Date.now();
            const expiryTimestamp =currentTimestamp + 30*1000;
            const filter ={email:email}
            const update={
                $set:{
                    email:email,
                    otp:otp,
                    expiry: new Date(expiryTimestamp),
                }
            }
            const options={upsert:true};
            await otpModel.updateOne(filter,update,options)
            await sendmail(email,otp)
            res.redirect('/regotp')
        }
    }
    catch (err){
        console.log("error occured",err)
        res.render("user/serverError")  

    }
}



//==========================================    user signup otp      ===============================================
const otp =async(req,res)=>{
    try{
        res.render("user/registration_otp",{
            expressFlash:{
                otperror:req.flash("otperror")
            }
        })
    }
    catch (err){
        console.log(err)
        res.render("user/serverError")  

    }
    
}

//===============================================     otp verifying page     ======================================
const verifyotp =async(req,res)=>{
    try{
        const enteredotp =req.body.otp;
        console.log("entered otp is",enteredotp,typeof(enteredotp))
        const user =req.session.user;
        const email =req.session.user.email;
        const userdb =await otpModel.findOne({email:email});
        const otp =userdb.otp;
        const expiry =userdb.expiry;        
        console.log("database otp",otp,"other otp is",enteredotp,expiry.getTime(),Date.now())


        if(enteredotp.toString() === otp.toString() && expiry.getTime() >= Date.now()){
            user.isVerified=true;
            try{
                if(req.session.signup){
                    await userModel.create(user);
                    const userdata =await userModel.findOne({email:email});
                    req.session.userId=userdata._id;
                    req.session.isAuth=true;
                    req.session.otppressed=false;
const referalCode = req.session.referal;

if (referalCode) {
    const winner = await userModel.findOne({ uniqueID: referalCode });

    if (winner) {
        const winnerID = winner._id;

        const wallet = await walletModel.findOne({ userId: winnerID });

        if (wallet) {
            const updatedWallet = wallet.wallet + 50;
            const winnerID = winner._id;

            await walletModel.findOneAndUpdate(
                { userId: winnerID },
                { $set: { wallet: updatedWallet } },
                { new: true }
            );

            const transaction = {
                date: new Date(),
                type: "Credited",
                amount: 50,
            };
            await walletModel.findOneAndUpdate({
                userId: winnerID
            },
            { $push: { walletTransactions: transaction } }
            );

        }

    }
}

res.redirect('/');

                }
                else if(req.session.forgot){
                    req.session.newpasspressed=true;
                    res.redirect('/resetpassword')
                }
            }
            catch(err){
                console.log('otp verify error',err)
            }
        }
        else{
            req.flash("otperror","Incorrect otp/time Expired")
            res.redirect("/regotp")
        }
        
        
    }
    catch (err){
        console.log("error occured",err);
        res.render("user/serverError")  

    }
}

//===================================      resend otp page     ===================================================
const resendotp =async(req,res)=>{
    try{
        const email =req.session.user.email;
        const otp = generatorotp();
        console.log("resend otp",otp);


        const currentTimestamp=Date.now();
        const expiryTimestamp =currentTimestamp +30 *1000;
        await otpModel.updateOne(
            {email:email},
            {otp:otp,
            expiry:new Date(expiryTimestamp)}
        );
        await sendmail(email,otp)
        res.redirect('/regotp')
    }
    catch(err){
        console.log(err,"resendotperror");
        res.render("user/serverError")  

    }
};

//====================================     forgot password    ==================================================
const forgotpassword=async (req,res)=>{
    try{
        res.render('user/forgot_password',{
            expressFlash:{
                emailerror:req.flash("emailerror")
            }
        })
    }
    catch(err){
        console.log(err,"forgot password error")
        res.render("user/serverError")  

    }
}
//=====================================    forgotpasswrod action    ============================================
const forgotpasspost =async (req,res)=>{
    try{
        let email =req.body.email;
        const emailExist =await userModel.findOne({email:email});
        if(!emailExist){
            req.flash('emailerror','Email doesnt Exist')
            res.redirect("/forgotpassword")
        }
        else{
            req.session.forgot=true;
            req.session.signup=false;
            req.session.user={email:email};
            const otp = generatorotp();
            const currentTimestamp= Date.now();
            expiryTimestamp =currentTimestamp + 60* 1000;
            const filter ={email:email};
            const update={
                $set:{
                    email:email,
                    otp:otp,
                    expiry: new Date(expiryTimestamp),
                }
            };
            const options={upsert:true};
            await otpModel.updateOne(filter, update, options);
            await  sendmail(email,otp);
            req.session.forgotpressed=false;
            req.session.otppressed=true;
            res.redirect('/regotp')


        }
        

    }
    catch(err){
        console.log(err,"forgotpost error");
        res.render("user/serverError")  

    }
}
//==============================       resett password page      ===================================================
const resetpassword =async (req,res)=>{
    try{

        res.render('user/reset_password')
    }
    catch(err){
        console.log('reset psssword error',err);
        res.render("user/serverError")  

    }
}

//=====================================     reset password post     ==========================================
const resetpasspost =async(req,res)=>{
    try{
        const password=req.body.password;
        const cpassword=req.body.cpassword;
        
        const isPasswordValid=passwordValid(password);
        const isCPasswordValid=confirmpasswordValid(cpassword,password);
        if(!isPasswordValid){
            res.render('user/reset_password',{perror:"Passsword should contain atleast one Uppercase, Lowercase, Digit, Special character"})
        }
        else if(!isCPasswordValid){
            res.render('user/reset_password',{cpasserror:'Password not match'});
        }
        else{
            const hashedpassword=await bcrypt.hash(password,10);
            const email=req.session.user.email;
            await userModel.updateOne({email:email},{
                password:hashedpassword,
            })
            req.session.newpasspressed=false;
            res.redirect('/profile')
        }
    }
    catch(err){
        console.log('reset password post error:',err);
        res.render("user/serverError")  

    }
}



//=========================================     profile page    ===================================================
const profile = async (req, res) => {
    try {
        if (req.session.isAuth) {
            const userId = req.session.userId;
            const user = await userModel.findOne({ _id: userId });
            const name = user.firstname;
            const categories= await categoryModel.find();
            res.render('user/profile',{name,categories});
        } else {
            req.session.forgotpressed = true;
            req.session.signuppressed = true;
            res.render('user/login',{
                expressFlash:{
                    emailpasserror: req.flash("emailpasserror"),
                    blockerror: req.flash("blockerror")
                }
            });
        }
    } catch (err) {
        res.render("user/serverError")  
        console.log("profile error", err);
    }
};


//========================================    login  action page     ===============================================

const loginaction=async(req,res)=>{ 
    try{
        const email =req.body.email;
        const  user = await userModel.findOne({email:email});
        //checking whether the user exist ir not
        if(!user){ 
            req.flash("emailpasserror","Invalid Email or Password")
             return res.redirect("/profile")
        }
        
        const passowrdmatch =await bcrypt.compare(req.body.password,user.password);
        if(passowrdmatch && !user.status){
            req.session.userId=user._id;
            req.session.firstname=user.firstname;
            req.session.isAuth=true;
             return res.redirect('/')
        }
        else if(user.status){
            req.flash('blockerror','SORRY! Your Account has been suspended !!!')
             return res.redirect('/profile')
        }
        else{
            req.flash("emailpasserror","Invalid Email or Password");
           return res.redirect('/profile')  
        }
    }
    catch(err){
       req.flash("emailpasserror","OOPS Something went wrong!");
       console.log(err,"login error")
       return res.redirect("/profile")
        

    }
}




//logout
const logout =async(req,res)=>{
    try{
        req.session.userId=null;
        req.session.isAuth=false;
        req.session.destroy()
        res.redirect('/')
    }
    catch(err){
        console.log(err,'logout error'); 
        res.render("user/serverError")  

    }
}



















module.exports={
    index,
    registration,
    otp,
    signotp,
    verifyotp,
    resendotp,
    profile,
    loginaction,
    forgotpassword,
    forgotpasspost,
    resetpassword,
    resetpasspost,



    logout,


}