const productModel=require('../models/productmodel');
const categoryModel=require('../models/categorymodel');
const mongoose = require("mongoose");
const mongoosePaginate  = require("mongoose-paginate-v2")
const ObjectId = mongoose.Types.ObjectId;

//================================     NEWEST ARRIVAL(BY DEFAULT)     =============================================
const newarrival = async (req, res) => {
    try {
        const page =req.query.page ||  1;
        const perpage = 6;
        let categoriesbanner = "The Shop";
        let products;
        let categories;
    const categoryId = req.query.category;
    const options = {
        page: page,
        limit:perpage,
        sort:{_id: -1}
    };
        if (categoryId) {
            const selectedCategory = await categoryModel.findById(categoryId);
            if (selectedCategory) {
                console.log(" seconsd if newArrivallllllllllllllllllllllllllllllllll query is presenst")

                categoriesbanner = selectedCategory// Set the category name as the banner
            }
            categories = await categoryModel.find({ status: true });
            products = await productModel.paginate({ categories: categoryId, status: true }, options);
        } else {
            console.log(" else newArrivallllllllllllllllllllllllllllllllll query is presenst")

            categories = await categoryModel.find({ status: true });
            const activeCategoryId = categories.map(category => category._id);
            products = await productModel.paginate({ categories: { $in: activeCategoryId }, status: true }, options);
        }

        console.log(categoriesbanner,'yyyyyyyyyyy999y')
        // res.render('user/shop', { products, categories, categoriesbanner });
        // res.json({"":"test"})
        // res.render('user/shop', { products, categories, categoriesbanner ,categoryId });
        res.render('user/shop', { req: req ,products: products.docs, categories, categoriesbanner, categoryId,page, pageCount: products.totalPages });
    } catch (err) {
    
        console.log('New Arrival error', err);
        res.status(500).send('Internal server error');
    }
};

//===================================     PRICE HIGH TO LOW    =====================================================
const pricehightolow = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const perPage = 6;
        const categoryId = req.query.category;

        let categoriesbanner = "The Shop";
        let categories;
        let products;

        const options = {
            page: page,
            limit: perPage,
            sort: { price: -1 }
        };

        if (categoryId) {
            const selectedCategory = await categoryModel.findById(categoryId);
            if (selectedCategory) {
                categoriesbanner = selectedCategory;
            }
            categories = await categoryModel.find({ status: true });

            // Use mongoose-paginate-v2 here
            products = await productModel.paginate({ categories: categoryId, status: true }, options);
        } else {
            categories = await categoryModel.find({ status: true });

            const activeCategoryId = categories.map(category => category._id);
            // Use mongoose-paginate-v2 here
            products = await productModel.paginate({ categories: { $in: activeCategoryId }, status: true }, options);
        }

        res.render('user/shop', { 
            products: products.docs, 
            categories, 
            categoriesbanner, 
            page, 
            pageCount: products.totalPages, 
            categoryId,
            req: req  // Pass the req object to the template
        });
    } catch (err) {
        console.log('Price high to low error', err);
        res.status(500).send('Internal server error');
    }
};


/// price low to high

const pricelowtohigh = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const perPage = 6;
        const categoryId = req.query.category;

        let categoriesbanner = "The Shop";
        let categories;
        let products;

        const options = {
            page: page,
            limit: perPage,
            sort: { price: 1 }
        };

        if (categoryId) {
            const selectedCategory = await categoryModel.findById(categoryId);
            if (selectedCategory) {
                categoriesbanner = selectedCategory;
            }
            categories = await categoryModel.find({ status: true });

            // Use mongoose-paginate-v2 here
            products = await productModel.paginate({ categories: categoryId, status: true }, options);
        } else {
            categories = await categoryModel.find({ status: true });

            const activeCategoryId = categories.map(category => category._id);
            // Use mongoose-paginate-v2 here
            products = await productModel.paginate({ categories: { $in: activeCategoryId }, status: true }, options);
        }

        res.render('user/shop', {req: req , products: products.docs, categories, categoriesbanner, page, pageCount: products.totalPages, categoryId });
    } catch (err) {
        console.log('Price low to high error', err);
        res.status(500).send('Internal server error');
    }
};

/////===========================     CATEGORIES VIEW PAGE     ==========================================

const catagorysort = async (req, res) => {
    try {
        const page =req.query.page ||  1;
        const perpage = 6;
        let categoriesbanner = "The Shop";
        let products;
        let categories;
    const categoryId = req.query.category;
    const options = {
        page: page,
        limit:perpage,
        sort:{_id: -1}
    };
        if (categoryId) {
            const selectedCategory = await categoryModel.findById(categoryId);
            if (selectedCategory) {
                console.log(" seconsd if newArrivallllllllllllllllllllllllllllllllll query is presenst")

                categoriesbanner = selectedCategory// Set the category name as the banner
            }
            categories = await categoryModel.find({ status: true });
            products = await productModel.paginate({ categories: categoryId, status: true }, options);
        } else {
            console.log(" else newArrivallllllllllllllllllllllllllllllllll query is presenst")

            categories = await categoryModel.find({ status: true });
            const activeCategoryId = categories.map(category => category._id);
            products = await productModel.paginate({ categories: { $in: activeCategoryId }, status: true }, options);
        }

        console.log(categoriesbanner,'yyyyyyyyyyy999y')
        // res.render('user/shop', { products, categories, categoriesbanner });
        // res.json({"":"test"})
        // res.render('user/shop', { products, categories, categoriesbanner ,categoryId });
        res.render('user/shop', { req: req ,products: products.docs, categories, categoriesbanner, categoryId,page, pageCount: products.totalPages });
    } catch (err) {
        console.log('catgorysort page error', err);
        res.status(500).send('Internal server error');
    }
};

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