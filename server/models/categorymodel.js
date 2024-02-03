const mongoose =require('mongoose')



const catSchema= new mongoose.Schema({
    name:{
        type:String,
        requried:true
    },
    offer:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    types:{
        type:Array,
        default:['All'],

    },
    status:{
        type:Boolean,
        default:true,
    }

})
const categoryModel=new mongoose.model("categories",catSchema)
module.exports= categoryModel;
