const categoryModel = require("../models/categorymodel");
const cartModel = require("../models/cartmodel");
const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel");
const favModel = require("../models/favouritemodel");

const showcart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const sessionId = req.session.id;
    const categories = await categoryModel.find();
    let cart;
    if (userId) {
      cart = await cartModel.findOne({ userId: userId }).populate({
        path: "item.productId",
        select: "images name price stock",
      });
    } else {
      cart = await cartModel.findOne({ sessionId: sessionId }).populate({
        path: "item.productId",
        select: "images name price ",
      });
    }
    if (!cart || !cart.item) {
      cart = new cartModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }
    console.log(cart, ":CART");
    res.render("user/cart.ejs", { cart: cart, categories: categories });
  } catch (err) {
    console.log("show cart error", err);
    res.status(500).send("Error occurred");
  }
};
//======================== addtoCart ================
const addToCart = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;
    const stock = product.stock;

    const quantity = 1;
    console.log(req.session.id, ":req.session.userId");

    if (stock == 0) {
      res.redirect("/cart");
    } else {
      let cart;
      if (userId) {
        cart = await cartModel.findOne({ userId: userId });
      }
      if (!cart) {
        cart = await cartModel.findOne({ sessionId: req.session.id });
      }
      if (!cart) {
        // Fix the typo here from '-' to '='
        cart = new cartModel({
          sessionId: req.session.id,
          item: [],
          total: 0,
        });
      }

      const productExist = cart.item.findIndex((item) => item.productId == pid);
      if (productExist !== -1) {
        cart.item[productExist].quantity += 1;
        cart.item[productExist].total =
          cart.item[productExist].quantity * price;
      } else {
        const newitem = {
          productId: pid,
          quantity: 1,
          price: price,
          stock: stock,
          total: quantity * price,
        };
        cart.item.push(newitem);
      }
      if (userId && !cart.userId) {
        cart.userId = userId;
      }
      cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);
      await cart.save();
      res.redirect("/cart");
    }
  } catch (err) {
    console.log("addtocart error", err);
  }
};
//=============================  UPDATE CART ================
const updatecart = async (req, res) => {
  try {
    console.log("Reached updat cart");
    console.log("Recieved req.body:", req.body);
    const { productId } = req.params;
    const { action, cartId } = req.body;
    const cart = await cartModel.findOne({ _id: cartId });
    console.log("Cartid:", cartId);
    console.log("cart:", cart);
    console.log(productId);
    const itemIndex = cart.item.findIndex((item) => item._id == productId);
    console.log(itemIndex);
    console.log("Cart items:", cart.item);
    console.log(cart.item[itemIndex].quantity);
    console.log(cart.item[itemIndex].stock);
    console.log(cart.item[itemIndex].price);
    const currentQuantity = cart.item[itemIndex].quantity;
    const selectedProductId = cart.item[itemIndex].productId;
    const selectedProduct = await productModel.findOne({
      _id: selectedProductId,
    });
    console.log("selected product:", selectedProduct);
    const stockLimit = selectedProduct.stock;
    console.log("stocklimit:", stockLimit);
    const price = cart.item[itemIndex].price;
    console.log("Received req.body:", req.body);
    console.log("Cart ID:", cartId);
    console.log("Cart Object:", cart);

    let updateQuantity;
    if (action == "1") {
      console.log("1");
      updateQuantity = currentQuantity + 1;
    } else if (action == "-1") {
      console.log("-1");
      updateQuantity = currentQuantity - 1;
    } else {
      return res.status(400).json({ success: false, error: "Invalid Actioon" });
    }
    if (updateQuantity < 1 || (updateQuantity > stockLimit && action == "1")) {
      return res
        .status(400)
        .json({ success: false, error: "Quantity exceeds stockLimit" });
      cart.item[itemIndex].quantity = updateQuantity;
    }
    cart.item[itemIndex].quantity = updateQuantity;
    const newProductTotal = price * updateQuantity;
    cart.item[itemIndex].total = newProductTotal;
    const total = cart.item.reduce((acc, item) => acc + item.total, 0);
    console.log("total:", total);
    cart.total = total;
    await cart.save();

    res.json({
      success: true,
      newQuantity: updateQuantity,
      newProductTotal,
      total: total,
    });
  } catch (err) {
    console.log("update cart error:", err);
  }
};
//=============================    DELETE CART ================

const deletecart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const pid = req.params.id;
    const size = req.params.size;
    console.log("delelting item", { userId, pid });
    const result = await cartModel.updateOne(
      { userId: userId },
      { $pull: { item: { _id: pid } } }
    );
    console.log("update result:", result);
    const updatedCart = await cartModel.findOne({ userId: userId });
    const newTotal = updatedCart.item.reduce((acc, item) => acc + item.total, 0);
    updatedCart.total = newTotal;
    await updatedCart.save();
    res.redirect("/cart");
  } catch (err) {
    console.log("delter cart error", err);
  }
};

module.exports = {
  showcart,
  addToCart,
  updatecart,
  deletecart,
};
