const mongoose = require('mongoose')
const bcrypt =require('bcryptjs')

//connecting mongodb
mongoose.connect('mongodb://127.0.0.1:27017/TimeZone')
.then( console.log("mongodb connected"))
.catch((err)=>console.log(err))



const userSchema =new mongoose.Schema({
    firstname:{type:String, required:true},
    lastname:{type:String, required:true},
    email:{type:String, requuired:true,unique:true},
    phone:{type:String,required:true},
    password:{type:String,required:true},
    status :{type:Boolean,default:false,required:true},
    isAdmin: {
        type:Boolean,default:false
    }

})


const userModel =new mongoose.model('userdetails',userSchema)
module.exports=userModel