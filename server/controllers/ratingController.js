const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel")


const ratepage = async(req,res)=>{
    try{
        const {id,rating,review} = req.query;
        const userId = req.session.userId;


        const productId  = id;
        console.log("prodictId",productId)
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
          }
          console.log("hyyyy33")

          const existingUserRating = product.userRatings.find((userRating) => userRating.userId.toString() === userId);
          console.log("existinguserRating",existingUserRating)

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
    }
}


module.exports = {
    ratepage,
}