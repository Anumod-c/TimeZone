const productModel=require('../models/productmodel');
const categoryModel=require('../models/categorymodel');


//================================NEWEST ARRIVAL(BY DEFA)=================================
const newarrival =async (req,res)=>{ //by default it will be newest arrival
    try{
        const products =await productModel.find({status:true}).sort({_id:-1})
        const categories=await categoryModel.find({status:true});
        res.render('user/shop',{categories:categories,products:products})
    }
    catch(err){
        console.log('shop page rendering error',err);
        res.status(500).send("Internal server error")
    }
}
//================================PRICE HIGH TO LOW===============================
const pricehightolow = async(req,res)=>{
    try{
        const products =await productModel.find().sort({price:-1})
        const categories =await categoryModel.find();
        res.render('/shop',{products:products,categories:categories})
        // const product = await productModel.findOne({ _id: mongoose.Types.ObjectId(id) });==>or can use this to sole te cast error
    }
    catch(err){
        console.log('price hight to low error',err);
        res.status(500).send('Interana server error')
    }
}


/////===========================CATEGORIES VIEW PAGE====================================

const catagorysort =async(req,res)=>{
    try{
        let products;
        if(req.query.category){
            products =await  productModel.find({ categories: req.query.category, status: true });
        }
        else{
            products = await productModel.find({ status: true });
            
        }
        const categories = await categoryModel.find({ status: true });
        
        res.render('user/shop', { products, categories });
    }
    catch(err){
        console.log('catgorysort page errror',err);
    }
}
//============================== SINGLE PRODUCT PAGE==============
const singleproduct = async(req,res)=>{
    try{
        const id =req.params.id;
        console.log('reached single product page');
        const product =await productModel.findOne({_id:id})
        const categories = await categoryModel.find();
        product.images = product.images.map(image => image.replace(/\\/g, '/'));
        res.render('user/singleproduct',{product:product,categories:categories})
    }
    catch(err){
        console.log('error while rendering single product page',err);
    }
}
//exporting
module.exports={
    newarrival,
    pricehightolow,
    
    catagorysort,
    singleproduct,


}