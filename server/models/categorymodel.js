const mongoose =require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/TimeZone')
.then( console.log(" category mongodb connected"))
.catch((err)=>console.log(err))

const catSchema= new mongoose.Schema({
    name:{
        type:String,
        requried:true
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
