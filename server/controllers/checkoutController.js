const categoryModel = require("../models/categorymodel");
const cartModel = require("../models/cartmodel");
const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel");
const favModel = require("../models/favouritemodel");
const mongoose = require("mongoose");
const orderModel = require("../models/ordermodel");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId({ length: 10 });

const {
  bnameValid,
  adphoneValid,
  pincodeValid,
} = require("../../utils/validators/address_Validators");

const placeOrder = async (req, res) => {
  try {
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
      productId: new mongoose.Types.ObjectId(
        req.body.selectedProductIds[index]
      ),
      singleprice: parseInt(req.body.selectedProductPrices[index]),
      quantity: parseInt(req.body.selectedQuantities[index]),
      price: parseInt(req.body.selectedCartTotals[index]),
    }));

    const order = new orderModel({
      orderId: uid.rnd(),
      userId: userId,
      userName: username,
      items: items,
      totalPrice: parseInt(req.body.carttotal),
      shippingAddress: selectedAddress,
      paymentMethod: paymentMethod,
      createdAt: new Date(),
      status: "Pending",
      updatedAt: new Date(),
    });
    console.log("Items:", items);

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

    res.render("user/order_confirmation", { order, categories });
  } catch (err) {
    console.log("placeorder error", err);
  }
};

const checkoutrelod = async(req,res)=>{
  try {
      const cartId = req.body.cartId
      console.log("is post address working");
      const {saveas,fullname,adname,street,pincode,city,state,country,phonenumber} = req.body
      console.log("gettig in body",req.body);
      const userId = req.session.userId
      console.log("body id",userId);
      const userExisted = await userModel.findOne({_id:userId})
      console.log("bhhhhhhhhhhhhhhhhhhh",userExisted);
      const fullnamevalid=bnameValid(fullname)
      const saveasvalid=bnameValid(saveas)
      const adnameValid=bnameValid(adname)
      const streetValid=bnameValid(street)
      const pinvalid=pincodeValid(pincode)
      const cityValid=bnameValid(city)
      const stateValid=bnameValid(state)
      const countryValid=bnameValid(country)
      const phoneValid=adphoneValid(phonenumber)
      console.log("assiing validation");
          if (!saveasvalid) {
            req.session.error= "Enter a valid adresstype"
            console.log('saveas error',req.session.error);


              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          if (!fullnamevalid) {
            req.session.error= "Enter a valid fullname"
            console.log('name error',req.session.error);

              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          if (!adnameValid) {
            req.session.error= "Enter a valid housename"
            console.log('adname error',req.session.error);

              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          if (!streetValid) {
            req.session.error= "Enter a valid street name"
            console.log('street error',req.session.error);

              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          if (!pinvalid) {
            req.session.error= "Enter a valid pincode"
            console.log('pin error',req.session.error);
              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          if (!cityValid) {
            req.session.error= "Enter a valid city"
            console.log('city error',req.session.error);

              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          if (!stateValid) {
            req.session.error= "Enter a valid State"
            console.log('state error',req.session.error);

              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          if (!countryValid) {
            req.session.error= "Enter a valid country";
            console.log('country error',req.session.error);

              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          console.log("eeeeeeeeeeeeee");
          if (!phoneValid) {
            req.session.error= "Enter a valid Phone number";
            console.log('phone error',req.session.error);

              return res.redirect(`/checkoutpage?cartId=${cartId}`);
          }
          console.log("validation of address completed");
          if (userExisted) {
            console.log("User existed reached");
              // Corrected query to find existing address for the user
              const existingAddress = await userModel.findOne({
                  '_id': userId,
                  "address.types": {
                      $elemMatch: {
                          saveas:saveas,
                          fullname: fullname,
                          adname: adname,
                          street: street,
                          pincode: pincode,
                          city: city,
                          state: state,
                          country: country,
                          phonenumber: phonenumber
                      }
                  }
              });
  
              if (existingAddress) {
                console.log('Existing user reached');

                  
                  return res.redirect('/checkoutpage');
              }
  console.log('line above the pushing function reached');
              userExisted.address.push({
                  saveas,
                  fullname,
                  adname,
                  street,
                  pincode,
                  city,
                  state,
                  country,
                  phonenumber:phonenumber
                 
              });
              console.log(("line above the userexisted .save"));
              await userExisted.save();
              console.log("usereExisted save worked");
          }
  
          const categories = await categoryModel.find();
          const addresslist = await userModel.findOne({ _id: userId });
  
          if (!addresslist) {
              console.log('User not found');
              // Handle the case where the user with the given userId is not found
              return res.status(404).send('User not found');
          }
  
          const addresses = addresslist.address;
          console.log("addressessssssssssssss:",addresses);
  
          // Check if cartId is provided and is valid
          if (!cartId) {
              console.log('Cart ID not provided');
              return res.status(400).send('Cart ID not provided');
          }
  
          // Find the cart by ID
          const cart = await cartModel.findById(cartId).populate('item.productId');
  
          // Check if cart exists
          if (!cart) {
              console.log('Cart not found');
              return res.status(404).send('Cart not found');
          }
  
          const cartItems = cart.item.map((cartItem) => ({
              productName: cartItem.productId.name,
              productId:cartItem.productId._id,
              quantity: cartItem.quantity,
              itemTotal: cartItem.total,
          }));
  console.log("jsbdhakljsholasjf",cartItems);
          console.log('Cart Total:', cart.total);
      

           
                  res.render("user/checkout",{addresses,cartItems,categories,cart}); 
      }
   catch (error) {
      console.log("cant add checkout addr");
      res.status(400).send("checkout addres not workoing")
    }
}

module.exports = {
  placeOrder,
  checkoutrelod,
};
