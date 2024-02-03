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
        console.log('E-mail sent Succesfully');
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
        console.log('datas in body:',req.body)
        let firstname=req.body.firstname;
        let lastname=req.body.lastname;
         let email=req.body.email;
        let phone=req.body.phone;
        let password=req.body.password;
        let cpassword=req.body.cpassword;
        console.log( "Entered Password",password);
        console.log("Entered Email",email);
        
        if(req.body.referal){
            req.session.referal = req.body.referal;
        }
        console.log("req.session.referal",req.session.referal)
        



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
        else{ console.log("Reached signotp else part");
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
        res.send('error occured',err)
    }
    
}

//===============================================     otp verifying page     ======================================
const verifyotp =async(req,res)=>{
    try{
        const enteredotp =req.body.otp;
        console.log("entered otp is",enteredotp,typeof(enteredotp))
        const user =req.session.user;
        console.log("user details",req.session.user);
        const email =req.session.user.email;
        const userdb =await otpModel.findOne({email:email});
        const otp =userdb.otp;
        const expiry =userdb.expiry;        
        console.log("database otp",otp,"other otp is",enteredotp,expiry.getTime(),Date.now())


        if(enteredotp.toString() === otp.toString() && expiry.getTime() >= Date.now()){
            console.log("Code checked enteredotp==otp")
            user.isVerified=true;
            try{
                console.log("creating user")
                if(req.session.signup){
                    await userModel.create(user);
                    console.log("User Created")
                    const userdata =await userModel.findOne({email:email});
                    req.session.userId=userdata._id;
                    req.session.isAuth=true;
                    req.session.otppressed=false;
const referalCode = req.session.referal;
console.log("referal in verifytotp", referalCode);

if (referalCode) {
    const winner = await userModel.findOne({ uniqueID: referalCode });

    if (winner) {
        const winnerID = winner._id;
        console.log("2222222222");

        const wallet = await walletModel.findOne({ userId: winnerID });
        console.log("1111111");

        if (wallet) {
            const updatedWallet = wallet.wallet + 50;
            console.log("winner._id:", winner._id);
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

            console.log(`added 50 to the wallet of user whose id matches ${referalCode}`);
        }

        console.log("winnerID:", winner._id.toString());
        console.log("walledtmodel working");
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
        console.log("error occured",err)
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
    }
}
//=====================================    forgotpasswrod action    ============================================
const forgotpasspost =async (req,res)=>{
    try{
        let email =req.body.email;
        console.log('forgotpassword email',email);
        const emailExist =await userModel.findOne({email:email});
        if(!emailExist){
            req.flash('emailerror','Email doesnt Exist')
            res.redirect("/forgotpassword")
        }
        else{
            req.session.forgot=true;
            req.session.signup=false;
            req.session.user={email:email};
            console.log({email:email},"user details from forgotpassword code");
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
    }
}
//==============================       resett password page      ===================================================
const resetpassword =async (req,res)=>{
    try{

        res.render('user/reset_password')
    }
    catch(err){
        console.log('reset psssword error',err);
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
            console.log(email)
            await userModel.updateOne({email:email},{
                password:hashedpassword,
            })
            req.session.newpasspressed=false;
            res.redirect('/profile')
        }
    }
    catch(err){
        console.log('reset password post error:',err);
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
        res.status(400).send("Error Occured")
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