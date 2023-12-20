const mongoose=require('mongoose')
const bcrypt =require('bcryptjs')


//schema structuring
const otpSchema =new mongoose.Schema({
    email:{type:String,rerquired:true,unique:true},
    otp:{type:Number,required:true},
    expiry:{type:Date,required:true}
})

//model creating
const otpModel =new mongoose.model('otp_detaILS',otpSchema)



//EXPORTING
module.exports=otpModel