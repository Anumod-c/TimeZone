const categoryModel = require("../models/categorymodel");
const cartModel = require("../models/cartmodel");
const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel");
const favModel = require("../models/favouritemodel");
const couponModel = require("../models/couponModel")

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
        select: "images name price stock",
      });
    }
    if (!cart || !cart.item) {
      cart = new cartModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    // Calculate the total quantity of items in the cart
    // const totalQuantity = cart.item.reduce((acc, item) => acc + item.quantity, 0);

    console.log(cart, ":CART");
    res.render("user/cart.ejs", { cart: cart, categories: categories });
  } catch (err) {
    console.log("show cart error", err);
    res.status(500).send("Error occurred");
  }
};

//========================================== addtoCart =============================================================
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
        cart.item[productExist].quantity += 1;///////////////////////////
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
      // const totalQuantity = cart.item.reduce((acc, item) => acc + item.quantity, 0);
      await cart.save();
      res.redirect("/cart");
    }
  } catch (err) {
    console.log("addtocart error", err);
  }
};
//======================================  UPDATE CART  ======================================================
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
    const totalQuantity = cart.item.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalQuantity =totalQuantity
    await cart.save();

    res.json({
      success: true,
      newQuantity: updateQuantity,
      newProductTotal,
      total: total,
      totalQuantity,
    });
  } catch (err) {
    console.log("update cart error:", err);
  }
};
//=============================    DELETE CART       ==============================================================

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
//===========================================   WISHLIST  ======================================================== 
const favouritepage =async(req,res)=>{
  try{
    const userId =req.session.userId;
    const sessionId = req.session.id;
    const categories= await categoryModel.find();
    let fav;
    if(userId){
      fav = await  favModel.findOne({userId:userId}).populate({
        path: 'item.productId',
        select: 'images name price',
      });
    }
    else{
      fav = await favModel.findOne({sessionId:sessionId}).populate({
        path: 'item.productId',
        select: 'images name price',
      })
    }
    if(!fav || !fav.item){
      cart = new favModel({
        sessionId:req.session.id,
        item:[],
        total:0,
      })
    }

          res.render('user/favourite',{fav:fav,categories:categories})

          console.log(fav,'==============fav')

  }
  catch(err){
    console.log('Favoouritepage error:',err);
  }
}

//=============================================     ADDING FAVOURITE     ========================================
const addToFav =async(req,res)=>{
  try{
    const pid =req.params.id;
    const product =await productModel.findOne({_id:pid});
    const userId = req.session.userId;

    const price = product.price;
    let fav;
    if(userId){
      fav = await favModel.findOne({userId:userId});

    }
    if(!fav){
      fav =await favModel.findOne({sessionId: req.session.id});

    }
    if(!fav){
      fav = new favModel({
        sessionId: req.session.id,
        item:[],
        total:0,
      })
    }
    // const productExist = fav.item.findIndex((item) => item.productId == pid);
    // if(productExist !== -1){
    //   fav.item[productExist].quantity += 1;
    //   fav.item[productExist].total = fav.item[productExist].quantity * price;
    // }
    // else{
      const newitem ={
        productId:pid,
        price:price,
        quantity:1,
      };
      fav.item.push(newitem)
    // }
     if(userId && !fav.userId){
      fav.userId = userId;

     }
     await fav.save();
     res.redirect('/favourite')
    
   
  }
  catch(err){
    console.log('addin fav errror',err);
  }
}
//========================================= DELETE FAVOURITE ===============================================
const deleteFav =async(req,res)=>{
  try{
    const userId = req.session.userId;
    console.log(userId,"oooooooooooooooo");
    const pid = req.params.id;
    console.log(pid,"oooooooooooooooo");

     await favModel.updateOne({userId:userId},{$pull:{item:{_id:pid}}});
    const updatefav = await favModel.findOne({userId:userId});
    await updatefav.save();
    res.redirect('/favourite')

  }
  catch(err){
    console.log('delteingg fav error',err);
  }
}
//========================================= ADD TO CART VIA FAVOURITE ==============================================
const addtocartviafav = async (req,res)=>{
  try{
    const pid = req.params.id;
    const product = await productModel.findOne({_id:pid});
    const userId = req.session.userId;
    const price = product.price;
    const stock= product.stock;
    const quantity = 1;
    let cart;
    if (userId) {
      cart = await cartModel.findOne({ userId: userId });
    }
    if (!cart) {
      cart = await cartModel.findOne({ sessionId: req.session.id });
    }
    if (!cart) {
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
      const newItem = {
        productId: pid,
        quantity: 1,
        price: price,
        stock :stock,
        total: quantity * price,
      };
      cart.item.push(newItem);
    }

    if (userId && !cart.userId) {
      cart.userId = userId;
    }

    cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);

    await cart.save();
    res.redirect('/cart');

  }
  catch(err){
    console.log('addtocart via fav errror',err);
  }
}

//=============================  CHECKOUT PAGE ===================

const checkoutpage =async(req,res)=>{
  try{
    console.log(" reacehd checkout");
    const categories = await categoryModel.find();
    const cartId = req.query.cartId;
    const userId = req.session.userId;
    const user = await userModel.findById(userId);
    const availableCoupons = await couponModel.find({
      couponCode: { $nin: user.usedCoupons },
      status:true
    });
      const  addresslist = await userModel.findOne({_id:userId});

    if(!addresslist){
      console.log('user not found');
      return res.status(404).send('User not found')
    }
    const addresses =addresslist.address;
    const cart = await cartModel.findById(cartId).populate('item.productId');
    for(const cartItem of cart.item || [] ){
      console.log(":cart item................",cartItem);
      const product = await productModel.findById(cartItem.productId);

      if(cartItem.quantity > product.stock){
        console.log('Selected quantity exceeds available stock for productId:', cartItem.productId);
        const nonitemid = cartItem.productId;
        const theitem = await productModel.findOne({_id:nonitemid});
        const nameitem = theitem.nameitem
        return res.render('user/cart',{cart,categories,message:` The product ${nameitem}'s quantity Exceeds StockLimit..!!`})
        
      }
    }
    const cartItems = (cart.item || []).map((cartItem)=>({
      productId:cartItem.productId._id,
      productName: cartItem.productId.name,
      price:cartItem.productId.price,
      quantity: cartItem.quantity,
      itemTotal: cartItem.total,
    }));
    console.log('Cart Total:', cart.total);
   

    
    await res.render('user/checkout', { availableCoupons,addresses, cartItems, categories, cart,cartId 
    //   ,expressFlash:{
    //   saveaserror:req.flash("saveaserror"),
    //   fullnameerror:req.flash("fullnameerror"),
    //   adnameerror:req.flash("adnameerror"),
    //   streeterror:req.flash("streeterror"),
    //   pinerror:req.flash("pinerror"),
    //   cityerror:req.flash("cityerror"),
    //   stateerror:req.flash("stateerror"),
    //   countryerror:req.flash("countryerror"),
    //   phonererror:req.flash("phonererror"),
      

    // }
  });

  }
  catch(err){
    console.log("checkout page error",err);
  }
}


module.exports = {
  showcart,
  addToCart,
  updatecart,
  deletecart,
  favouritepage,
  addToFav,
  deleteFav,
  addtocartviafav,
  checkoutpage,

};
