const userModel =require('../models/usermodel')
const bcrypt=require('bcrypt')
const otpgenerator=require('otp-generator')
const nodemailer=require('nodemailer')
const {nameValid,
    lnameValid, 
    emailValid,phoneValid,
    passwordValid,
    confirmpasswordValid}=require('../../utils/validators/usersignupvalidator')
const otpModel = require('../models/userotpmodel')
const {Email,pass}=require('../../.env')
const categoryModel = require('../models/categorymodel')
const productModel = require('../models/productmodel')



//otp generating function
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
//otp email sending funtion
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
        transporter.sendMail(mailOptions);
        console.log('E-mail sent Succesfully');
    }
    catch (err){
        console.log("error in sending email",err)
    }
}


//home page rendering 
const index=async(req,res)=>{
try{
    const categories= await categoryModel.find({status:true});
    const products=await productModel.find({status:true}).sort({_id:-1}).limit(6)
    console.log(products,'hyhyhyhyhyh');
    res.render('user/index',{categories:categories,products:products})
}
catch(err){
console.log(err,"homepage error");    
}}


//user signup
const registration =async(req,res)=>{
    req.session.otppressed=true;
    await res.render("user/registration")
}

//user otp sending
const signotp = async(req,res)=>{
    try{       
        console.log('datas in body:',req.body)
        firstname=req.body.firstname;
        lastname=req.body.lastname;
        email=req.body.email;
        phone=req.body.phone;
        password=req.body.password;
        cpassword=req.body.cpassword;
        console.log( "Entered Password",password);
        console.log("Entered Email",email);


        const isFnameValid=nameValid(firstname);
        const isLnameValid =lnameValid(lastname);
        const isEmailValid =emailValid(email);
        const isPhoneValid =phoneValid(phone)
        const isPasswordValid =passwordValid(password);
        const isCPasswordValid =confirmpasswordValid(cpassword,password)

        const emailExist =await userModel.findOne({email:email})
        if(emailExist){
            res.render('user/registration',{emailexist:"E-Mail already exist"})
        }
        else if(!isFnameValid){
            res.render('user/registration',{fnameerror:"Enter a Valid Name"})
        }
        else if(!isLnameValid){
            res.render('user/registration',{lnameerror:"Enter a Valid Name"})
        }
        
        else if(!isEmailValid){
            res.render('user/registration',{emailerror:"Enter a Valid Email"})
        }
        else if(!isPhoneValid){
            res.render('user/registration',{phoneerror:"Enter a Valid Phone Number"})
        }
        else if(!isPasswordValid){
            res.render('user/registration',{passworderror:"Enter a Valid Password"})
        }
        else if(!isCPasswordValid){
            res.render('user/registration',{cpassworderror:"Enter a Valid Password"})
        }
        else{ console.log("Reached signotp else part");
            const hashedpassword=await bcrypt.hash(password,10);
            const user =new userModel({
                firstname:firstname,
                lastname:lastname,
                email:email,
                phone:phone,
                password:hashedpassword
            })
            req.session.user = user;
            req.session.signup = true;
            req.session.forgot = false;

           // await user.save();
            //res.redirect('/regotp')
            
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



//user signup otp
const otp =async(req,res)=>{
    try{
        res.render("user/registration_otp")
    }
    catch (err){
        console.log(err)
        res.send('error occured',err)
    }
    
}

//otp verifying page
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
                    req.session.isAuth=true;//===>isAuth is wittene here -should check  the use  <=== 
                    req.session.otppressed=false;
                    res.redirect('/')
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
            res.render('user/registration_otp',{otperror:"Incorrect otp/time Expired"})
        }
        
        
    }
    catch (err){
        console.log("error occured",err)
    }
}

//resend otp page
const resendotp =async(req,res)=>{
    try{
        console.log("resend otp is working");
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
    }
    catch(err){

    }
};

//forgot password
const forgotpassword=async (req,res)=>{
    try{
        res.render('user/forgot_password')
    }
    catch(err){
        console.log(err,"forgot password error")
    }
}
//forgotpasswrod action
const forgotpasspost =async (req,res)=>{
    try{
        email =req.body.email;
        console.log('forgotpassword email',email);
        const emailExist =await userModel.findOne({email:email});
        console.log(emailExist,"email exist")
        if(emailExist){
            req.session.forgot=true;
            req.session.signup=false;
            req.session.user={email:email};
            console.log({email:email},"user details from forgotpassword code");
            const otp = generatorotp();
            console.log('otp generated for forgot password:',otp);
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
        else{
            res.redirect('/forgotpassword',{emailerror :'Email doesnt Exist'})
        }

    }
    catch(err){
        console.log(err,"forgotpost error");
    }
}
//resett password page
const resetpassword =async (req,res)=>{
    try{

        res.render('user/reset_password')
    }
    catch(err){
        console.log('reset psssword error',err);
    }
}

//reset password post
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
            console.log('code before update querey executed succesfully')
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



//profile page
const profile = async (req, res) => {
    try {
        console.log("User ID from session:", req.session.userId);
        if (req.session.isAuth) {
            const userId = req.session.userId;
            const user = await userModel.findOne({ _id: userId });
            const name = user.firstname;
            const categories= await categoryModel.find();
            res.render('user/profile',{name,categories});
        } else {
            req.session.forgotpressed = true;
            req.session.signuppressed = true;
            res.render('user/login');
        }
    } catch (err) {
        console.log("profile error", err);
    }
};


//login  action page

const loginaction=async(req,res)=>{ //the whole profile page should be changed ,and check the route of login page and profile page as it is changed
    try{
        const email =req.body.email;
        const  user = await userModel.findOne({email:email});
        //checking whether the user exist ir not
        if(!user){ //    (!user)
            console.log("throwing error")
            throw new Error('User Not Found')
        }
        
        const passowrdmatch =await bcrypt.compare(req.body.password,user.password);
        if(passowrdmatch && !user.status){
            console.log('hhh');
            req.session.userId=user._id;
            req.session.firstname=user.firstname;
            req.session.isAuth=true;
            res.redirect('/')
        }
        else if(user.status){
           res.render('user/login',{blockerror:'SORRY! Your Account has been suspended !!!'})
        }
        else{
            res.render('user/login',{passworderror:"invalid password"})  
        }
    }
    catch(err){
        res.render('user/login',{emailerror:"Incorrect Email"})
        console.log(err)

    }
}

//======================SHOP PAGE RENDERING========================


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