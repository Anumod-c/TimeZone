const mongoose=require('mongoose');






const productSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    categories: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
    },
    mrp:{
        type:Number,
       
    },
    price:{
        type:Number,
        required:true,
    },
    images:{
        type:Array,
        required:true,
    },
    stock:{
        type:Number,
        required:true,

    },
    status:{
        type:Boolean,
        default:true,

    },
    descriptions:{
        type:String,
        required:true,

    },
    dialcolour:{
        type:String,
        required:true,

    },
    strapcolour:{
        type:String,
        required:true,

    },
    framematerial:{
        type:String,
        required:true,
    },
    strapmaterial:{
        type:String,
        required:true,
    },
    dimensions:{
        type:String,
        required:true,
    },
    manufacture:{
        type:String,
        default:'',
    },
    userRatings: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userdetails', required: true },
            rating: { type: Number },
            review: { type: String },
        },
    ]

})

const productModel=new mongoose.model("products",productSchema)

module.exports=productModel

