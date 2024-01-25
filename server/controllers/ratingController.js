const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel")


const ratepage = async(req,res)=>{
    try{
        console.log("hyyyy")
        const {id,rating,review} = req.query;
        const userId = req.session.userId;
        console.log("hyyyy")


        const productId  = id;
        console.log("prodictId",productId)
        const product = await productModel.findById(productId);
        console.log("product",product)
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