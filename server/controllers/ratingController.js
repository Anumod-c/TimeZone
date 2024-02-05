const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel")


const ratepage = async(req,res)=>{
    try{
        const {id,rating,review} = req.query;
        const userId = req.session.userId;


        const productId  = id;
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
          }

          const existingUserRating = product.userRatings.find((userRating) => userRating.userId.toString() === userId);

          if (existingUserRating) {
              existingUserRating.rating = rating;
              existingUserRating.review = review;
          } else {
              product.userRatings.push({ userId, rating, review });
          }
          
          await product.save();
          res.redirect("/orderHistory")

    }
    catch(err){
        console.log("rating page error",err);
        res.render("user/serverError")  

    }
}


module.exports = {
    ratepage,
}