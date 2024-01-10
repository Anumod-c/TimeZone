const categoryModel = require("../models/categorymodel");
const cartModel = require("../models/cartmodel");
const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel");
const favModel = require("../models/favouritemodel");
const mongoose=require("mongoose")
const orderModel =require('../models/ordermodel')
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 10 });


const placeOrder = async(req,res)=>{
    try{
        const categories = await categoryModel.find({});
        const addressId = req.body.selectedAddressId;
        const user = await userModel.findOne({
            address: { $elemMatch: { _id: addressId } },
          });
          const selectedAddress = user.address.find((address) =>
          address._id.equals(addressId)
        );
        const userId = req.session.userId;
    const username = selectedAddress.fullname;
    const paymentMethod = req.body.selectedPaymentOption;
    const cartId = req.body.cartId;


    const items = req.body.selectedProductNames.map((productName, index) => ({
        productName: req.body.selectedProductNames[index],
        productId: new mongoose.Types.ObjectId(req.body.selectedProductIds[index]),
        singleprice:parseInt(req.body.selectedProductPrices[index]),
        quantity: parseInt(req.body.selectedQuantities[index]),
        price: parseInt(req.body.selectedCartTotals[index]),
      }));

      const order = new orderModel({
        orderId:uid.rnd(),
        userId: userId,
        userName: username,
        items: items,
        totalPrice: parseInt(req.body.carttotal),
        shippingAddress: selectedAddress,
        paymentMethod: paymentMethod,
        createdAt: new Date(),
        status: 'Pending',
        updatedAt: new Date(),
      });
      console.log('Items:', items);
  
      await order.save();
      for (const item of items) {
        await cartModel.updateOne(
          { userId: userId },
          { $pull: { item: { productId: item.productId } } }
        );
  
        await cartModel.updateOne({ userId: userId }, { $set: { total: 0 } });
      }
  
      for (const item of items) {
        await productModel.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }
  
      res.render('user/order_confirmation', { order, categories });
       

    }
    catch(err){
        console.log('placeorder error',err);
    }
}

module.exports={
    placeOrder,

}