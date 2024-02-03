const categoryModel = require("../models/categorymodel");
const cartModel = require("../models/cartmodel");
const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel");
const favModel = require("../models/favouritemodel");
const mongoose = require("mongoose");
const orderModel = require("../models/ordermodel");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId({ length: 10 });
const Razorpay = require("razorpay");
const key_id = process.env.key_id;
const key_secret = process.env.key_secret;

const {
  bnameValid,
  adphoneValid,
  pincodeValid,
} = require("../../utils/validators/address_Validators");
const walletModel = require("../models/walletModel");
const couponModel = require("../models/couponModel");

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

const checkoutrelod = async (req, res) => {
  try {
    console.log("checkout reload worked");
    const cartId = req.body.cartId;
    console.log(" post address working");
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phonenumber,
    } = req.body;
    const userId = req.session.userId;
    const userExisted = await userModel.findOne({ _id: userId });
    const availableCoupons = await couponModel.find({
      couponCode: { $nin: userExisted.usedCoupons }
    }); ///////////////////////////////////
    const fullnamevalid = bnameValid(fullname);
    const saveasvalid = bnameValid(saveas);
    const adnameValid = bnameValid(adname);
    const streetValid = bnameValid(street);
    const pinvalid = pincodeValid(pincode);
    const cityValid = bnameValid(city);
    const stateValid = bnameValid(state);
    const countryValid = bnameValid(country);
    const phoneValid = adphoneValid(phonenumber);
    if (!saveasvalid) {
      // req.flash("saveaserror", "Enter a valid adresstype");
      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }
    if (!fullnamevalid) {
      // req.flash("fullnameerror", "Enter a valid fullname");
      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }
    if (!adnameValid) {
      // req.flash("adnameerror", "Enter a valid housename");
      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }
    if (!streetValid) {
      // req.flash("streeterror", "Enter a valid street name");
      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }
    if (!pinvalid) {
      // req.flash("pinerror", "Enter a valid pincode");
      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }
    if (!cityValid) {
      // req.flash("cityerror", "Enter a valid city");

      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }
    if (!stateValid) {
      // req.flash("stateerror", "Enter a valid State");
      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }
    if (!countryValid) {
      // req.flash("countryerror", "Enter a valid country");
      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }

    if (!phoneValid) {
      // req.flash("phonererror", "Enter a valid Phone number");

      return res.redirect(`/checkoutpage?cartId=${cartId}`);
    }
    console.log("validation of address completed");
    if (userExisted) {
      console.log("User existed reached");
      // Corrected query to find existing address for the user
      const existingAddress = await userModel.findOne({
        _id: userId,
        "address.types": {
          $elemMatch: {
            saveas: saveas,
            fullname: fullname,
            adname: adname,
            street: street,
            pincode: pincode,
            city: city,
            state: state,
            country: country,
            phonenumber: phonenumber,
          },
        },
      });

      if (existingAddress) {
        console.log("Existing user reached");

        return res.redirect("/checkoutpage");
      }
      console.log("line above the pushing function reached");
      userExisted.address.push({
        saveas,
        fullname,
        adname,
        street,
        pincode,
        city,
        state,
        country,
        phonenumber,
      });
      console.log("line above the userexisted .save");
      await userExisted.save();
      console.log("usereExisted save worked");
    }
    const categories = await categoryModel.find();
    const addresslist = await userModel.findOne({ _id: userId });

    if (!addresslist) {
      console.log("User not found");
      // Handle the case where the user with the given userId is not found
      return res.status(404).send("User not found");
    }

    const addresses = addresslist.address;

    // Check if cartId is provided and is valid
    if (!cartId) {
      console.log("Cart ID not provided");
      return res.status(400).send("Cart ID not provided");
    }

    // Find the cart by ID
    const cart = await cartModel.findById(cartId).populate("item.productId");

    // Check if cart exists
    if (!cart) {
      console.log("Cart not found");
      return res.status(404).send("Cart not found");
    }

    const cartItems = cart.item.map((cartItem) => ({
      productName: cartItem.productId.name,
      productId: cartItem.productId._id,
      quantity: cartItem.quantity,
      price: cartItem.productId.price,
      itemTotal: cartItem.total,
    }));

    res.render("user/checkout", { addresses, cartItems, categories, cart,availableCoupons });
  } catch (error) {
    console.log("cant add checkout addr",error);
    res.status(400).send("checkout addres not workoing",);
  }
};

///////////////////////        RAZOR PAY          ///////////////////
const instance = new Razorpay({ key_id: key_id, key_secret: key_secret });

const upi = async (req, res) => {
  console.log("body:", req.body);
  var options = {
    amount: 500,
    currency: "INR",
    receipt: "order_rcpt",
  };
  instance.orders.create(options, function (err, order) {
    console.log("order1 :", order);
    res.send({ orderId: order.id });
  });
};

// ================================== WALLET TRANSACTION   ==========================================

const wallettransaction = async (req, res) => {
  try {
    const userId = req.session.userId;
    const amount = req.body.amount;
    const user = await walletModel.findOne({ userId: userId });
    const wallet = user.wallet;

    if (user.wallet > amount) {
      user.wallet -= amount;
      await user.save();
      const wallet = await walletModel.findOne({ userId: userId });
      wallet.walletTransactions.push({
        type: "Debited",
        amount: amount,
        date: new Date(),
      });
      await wallet.save();
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "don't have enought money" });
    }
  } catch {
  }
};

//====================================== COUPON =============================
const applyCoupon = async (req, res) => {
  try {
    const { couponCode, subtotal } = req.body;
    const userId = req.session.userId;
    const coupon = await couponModel.findOne({ couponCode: couponCode });

    if (coupon && coupon.status === true) {
      const user = await userModel.findOne({_id:userId});
      if (user && user.usedCoupons.includes(couponCode)) {
        res.json({ success: false, message: "Already Redeemed" });
      } else if (
        coupon.expiry > new Date() &&
        coupon.minimumPrice <= subtotal
      ) {
        let dicprice;
        let price;
        if (coupon.type === "percentageDiscount") {
          dicprice = (subtotal * coupon.discount) / 100;
          if (dicprice >= coupon.maxRedeem) {
            dicprice = coupon.maxRedeem;
          }
          price = subtotal - dicprice;
        } else if (coupon.type === "flatDiscount") {
          dicprice = coupon.discount;
          price = subtotal - dicprice;
        }
        await userModel.findByIdAndUpdate(
          userId,
          { $addToSet: { usedCoupons: couponCode } },
          { new: true }
        );
        res.json({ success: true, dicprice, price });
      } else {
        res.json({ success: false, message: "Invalid Coupon" });
      }
    } else {
      res.json({ success: false, message: "Coupon not found" });
    }
  } catch (err) {
    console.log("coupon error", err);
  }
};

/// ==========================       REVOKE COUPON============

const revokeCoupon = async(req,res)=>{
  try{
    const {couponCode,subtotal} = req.body;
    const userId = req.session.userId;
    const coupon=  await couponModel.findOne({couponCode:couponCode});
    if(coupon){
      const user = await userModel.findById(userId);

      if(coupon.expiry > new Date() && coupon.minimumPrice <= subtotal){
        const dprice = (subtotal * coupon.discount) / 100;
            const dicprice = 0;

            const price = subtotal;

            await userModel.findByIdAndUpdate(
              userId,
              { $pull: { usedCoupons: couponCode } },
              { new: true }
            );
            res.json({ success: true, dicprice, price });
        } else {
            res.json({ success: false, message: "Invalid Coupon" });
        }
    } else {
        res.json({ success: false, message: "Coupon not found" });
    }
    

  }
  catch(err){
    console.log("REVOKE EROOR",err);
  }
}

module.exports = {
  placeOrder,
  checkoutrelod,
  upi,
  wallettransaction,
  applyCoupon,
  revokeCoupon,
};
