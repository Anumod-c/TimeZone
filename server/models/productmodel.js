const mongoose=require('mongoose');

const mongoosePaginate = require('mongoose-paginate-v2');




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
    discount:{
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
productSchema.plugin(mongoosePaginate);

const productModel=new mongoose.model("products",productSchema)

module.exports=productModel

