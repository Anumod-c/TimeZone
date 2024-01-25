const productModel=require('../models/productmodel');
const categoryModel=require('../models/categorymodel');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//================================     NEWEST ARRIVAL(BY DEFAULT)     =============================================
const newarrival =async (req,res)=>{ //by default it will be newest arrival
    try{
        const categories=await categoryModel.find({status:true});
        const activeCategoryId = categories.map(category=> category._id);
        const products = await productModel.find({ categories: { $in: activeCategoryId }, status: true })
        .sort({ _id: -1 });
        const categoriesbanner="The Shop"
        res.render('user/shop',{categories:categories,products:products,categoriesbanner})
    }
    catch(err){
        console.log('shop page rendering error',err);
        res.status(500).send("Internal server error")
    }
}
//===================================     PRICE HIGH TO LOW    =====================================================
const pricehightolow = async(req,res)=>{
    try{
       
        const categories =await categoryModel.find({status:true});
        const activeCategoryId = categories.map(category=> category._id);
        const products = await productModel.find({ categories: { $in: activeCategoryId }, status: true })
        .sort({ price: -1 });
        console.log(products,"dddddddddddddddddddddddd");
        const categoriesbanner='The Shop'
        res.render('user/shop',{products:products,categories:categories,categoriesbanner})
        // const product = await productModel.findOne({ _id: mongoose.Types.ObjectId(id) });==>or can use this to sole te cast error
    }
    catch(err){
        console.log('price hight to low error',err);
        res.status(500).send('Interana server error')
    }
}
/// price low to high

const pricelowtohigh = async (req,res)=>{
    try{
       
        const categories = await  categoryModel.find({status:true});
        const activeCategoryId = categories.map(category=> category._id);
        const products = await productModel.find({ categories: { $in: activeCategoryId }, status: true })
        .sort({ price: 1 });
        const categoriesbanner='The Shop';
        res.render('user/shop',{products:products,categories:categories,categoriesbanner});



    }
    catch(err){
        console.log("price low to high",err);
    }
}

/////===========================     CATEGORIES VIEW PAGE     ==========================================

const catagorysort =async(req,res)=>{
    try{

        const categoriesbanner =await categoryModel.findOne({_id:req.query.category})
        let products;
        if(req.query.category){
            products =await  productModel.find({ categories: req.query.category, status: true });
        }
        else{
            products = await productModel.find({ status: true });
            
        }
        const categories = await categoryModel.find({ status: true });
        
        res.render('user/shop', { products, categories,categoriesbanner });
    }
    catch(err){
        console.log('catgorysort page errror',err);
    }
}
//========================================     SINGLE PRODUCT PAGE        ==================================
const singleproduct = async(req,res)=>{
    try{
        const id =req.params.id;
        console.log('reached single product page');
        const product =await productModel.findOne({_id:id}).populate({
            path: "userRatings.userId",
            select: "firstname",
          });
          const convertedId = new ObjectId(id);

          const result = await productModel.aggregate([
            {
              $match: { _id: convertedId },
            },
            {
              $unwind: { path: "$userRatings", preserveNullAndEmptyArrays: true },
            },
            {
              $group: {
                _id: null,
                averageRating: { $avg: "$userRatings.rating" },
                totalRatings: { $sum: 1 },
              },
            },
          ]);
      
          const averageRating = result.length > 0 ? result[0].averageRating : 0;
          const totalRatings = result.length > 0 ? result[0].totalRatings : 0;



        const categories = await categoryModel.find();
        product.images = product.images.map(image => image.replace(/\\/g, '/'));
        res.render('user/singleproduct',{product:product,categories:categories,
            averageRating,
            totalRatings,})
    }
    catch(err){
        console.log('error while rendering single product page',err);
    }
}

//===========================             SEARCH              =============================
const search = async (req, res) => {
    try {
        const categoriesbanner = "The Shop";
        const categories = await categoryModel.find();

        const searchproduct = req.body.searchproduct;
        const products = await productModel.aggregate([
            {
                $match: {
                    $and: [
                        { name: { $regex: new RegExp(searchproduct, "i") } },
                        { status: true }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'categories',  // Assuming your category collection name is 'categories'
                    localField: 'categories',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $match: {
                    'category.status': true
                }
            },
            {
                $project: {
                    category: 0  // Exclude the 'category' field from the final result
                }
            }
        ]);

        console.log(searchproduct, "searchpp");
        res.render("user/shop", { products: products, categories: categories, categoriesbanner: categoriesbanner });
    } catch (err) {
        console.log("Search not working", err);
        res.status(500).send("Internal server error");
    }
};


////////////////////////////search post/////////////
//exporting
module.exports={
    newarrival,
    pricehightolow,
    
    catagorysort,
    singleproduct,
    pricelowtohigh,
    search,


}