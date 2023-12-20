const mongoose=require('mongoose');


mongoose.connect('mongodb://127.0.0.1:27017/TimeZone',{useNewUrlParser:true,useUnifieldTopology:true})
.then( console.log(" mongo product mondel connected"))
.catch((err)=>console.log(err))



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
        required:true
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
    }

})

const productModel=new mongoose.model("products",productSchema)

module.exports=productModel

