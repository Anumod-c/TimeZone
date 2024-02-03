const mongoose=require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')


const orderschema=mongoose.Schema({
    orderId:{
        type:String,
        unique:true
        },
        userId:{
            type:String,
            required:true
        },
        userName:{
            type:String,
            required:true
        },
        items:{
            type:Array,
            required:true
        }, 
        totalPrice:{
            type:Number,
            required:true
        },
        shippingAddress:{
            type:Object,
            required:true
        },
        paymentMethod:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            required:true
        },
        status:{
            type:String,
            required:true,

        },
        updatedAt:{
            type:Date,
        }
})
orderschema.plugin(mongoosePaginate);
const orderModel=new mongoose.model("orders",orderschema)

module.exports=orderModel;