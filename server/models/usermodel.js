const mongoose = require('mongoose')
const bcrypt =require('bcryptjs')

//connecting mongodb




const userSchema =new mongoose.Schema({
    firstname:{type:String, required:true},
    lastname:{type:String, required:true},
    email:{type:String, requuired:true,unique:true},
    age:{type:String,required:false},
    gender:{type:String,required:false},

    phone:{type:String,required:true},
    password:{type:String,required:true},
     address: {
        type: [{
          saveas:{type:String},
          fullname:{type:String},
          adname:{type:String},
          street: { type: String},
          pincode:{type:Number},
          city: { type: String },
          state:{type:String},
          country:{type:String},
          phonenumber:{type:Number}
        }]},
        uniqueID:{type:String},
    status :{type:Boolean,default:false,required:true},
    isAdmin: {
        type:Boolean,default:false
    },
    usedCoupons:
    [{ type: String }],
    

})


const userModel =new mongoose.model('userdetails',userSchema)
module.exports=userModel