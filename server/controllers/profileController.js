const categoryModel = require("../models/categorymodel");
const userModel = require("../models/usermodel");
const productModel = require("../models/productmodel");
const walletModel = require("../models/walletModel");
const couponModel = require("../models/couponModel")
const flash = require("express-flash");
const orderModel = require("../models/ordermodel");
const mongoose = require("mongoose");
const easyinvoice = require("easyinvoice");
const { ObjectId } = mongoose.Types;

const bcrypt = require("bcrypt");
const {
  nameValid,
  lnameValid,
  emailValid,
  phoneValid,
  passwordValid,
  confirmpasswordValid,
} = require("../../utils/validators/usersignupvalidator");

const {
  bnameValid,
  adphoneValid,
  pincodeValid,
} = require("../../utils/validators/address_Validators");

//================================ USER DETAILS PAGE RENDERING   ===================================
const userdetials = async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await categoryModel.find();
    const userData = await userModel.findOne({ _id: userId });
    res.render("user/userdetails", {
      categories: categories,
      userData: userData,
    });
  } catch (err) {
    console.log("userdetailserror", err);
  }
};
//==================================== EDIT PROFILE GET =============================================
const editprofile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await categoryModel.find();
    const userData = await userModel.findOne({ _id: userId });
    res.render("user/editprofile", {
      categories: categories,
      userData: userData,
    });
  } catch (err) {
    console.log("edit profile error", err);
  }
};
//=================================== EDIT PROFILE POST =======================================
const updateprofile = async (req, res) => {
  try {
    const { firstname, lastname, email, gender, age, phone } = req.body;
    console.log(firstname, lastname, email, age, phone, gender);
    const userId = req.session.userId;
    const data = await userModel.updateOne(
      { _id: userId },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
          phone: phone,
          age: age,
          gender: gender,
        },
      }
    );
    console.log(data, "updated details");
    res.redirect("/userdetails");
  } catch (err) {
    console.log("profile post error");
  }
};

//========================================ADD NEW ADDRESS PAGE ================================================
const addnewaddress = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.render("user/newAddress", {
      categories: categories,
      expressFlash: {
        fullnameerror: req.flash("fullnameerror"),
        saveaserror: req.flash("saveaserror"),
        adnameerror: req.flash("adnameerror"),
        streeterror: req.flash("streeterror"),
        pincodeerror: req.flash("pincodeerror"),
        cityerror: req.flash("cityerror"),
        stateerror: req.flash("stateerror"),
        countryerror: req.flash("countryerror"),
        phoneerror: req.flash("phoneerror"),
        addressexsitserror: req.flash("addressexsitserror"),
      },
    });
  } catch (err) {
    console.log("add new address page rendering error", err);
  }
};
//================================================NEW ADDRESS POST   =============================
const addnewaddresspost = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const {
      saveas,
      fullname,
      adname,
      street,
      city,
      state,
      pincode,
      country,
      phonenumber,
    } = req.body;
    const userId = req.session.userId;
    console.log("user_id", userId);
    const existingUser = await userModel.findOne({ _id: userId });
    console.log(existingUser, "tueeeeeeeeeeeeeee");
    const fullnamevalid = bnameValid(fullname); //
    const saveasvalid = bnameValid(saveas); //
    const adnameValid = bnameValid(adname); //
    const streetValid = bnameValid(street);
    const pinvalid = pincodeValid(pincode);
    const cityValid = bnameValid(city);
    const stateValid = bnameValid(state);
    const countryValid = bnameValid(country);
    const phoneValid = adphoneValid(phonenumber);

    if (!fullnamevalid) {
      console.log("fullname valid");
      req.flash("fullnameerror", "Enter a Valid name");
      return res.redirect("/addnewaddress");
    }
    if (!saveasvalid) {
      console.log("svaes valid");
      req.flash("saveaserror", "Enter a Valid Address Type");
      return res.redirect("/addnewaddress");
    }
    if (!adnameValid) {
      console.log("adname valid");
      req.flash("adnameerror", "Enter a Valid Name");
      return res.redirect("/addnewaddress");
    }
    if (!streetValid) {
      console.log("street valid");
      req.flash("streeterror", "Enter a Valid Street");
      return res.redirect("/addnewaddress");
    }
    if (!pinvalid) {
      console.log("pin valid");
      req.flash("pincodeerror", "Enter a Valid Pin");
      return res.redirect("/addnewaddress");
    }
    if (!cityValid) {
      console.log("city valid");
      req.flash("cityerror", "Enter a Valid City");
      return res.redirect("/addnewaddress");
    }
    if (!stateValid) {
      console.log("state valid");
      req.flash("stateerror", "Enter a Valid State");
      return res.redirect("/addnewaddress");
    }
    if (!countryValid) {
      console.log("contruy valid");
      req.flash("countryerror", "Enter a Valid Country");
      return res.redirect("/addnewaddress");
    }
    if (!phoneValid) {
      console.log("phone valid");
      req.flash("phoneerror", "Enter a Valid Phone");
      return res.redirect("/addnewaddress");
    }

    if (existingUser) {
      console.log("exsirt user if worked valid");
      const existingAddress = await userModel.findOne({
        _id: userId,
        address: {
          $elemMatch: {
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
        console.log("exist adress if worked valid");
        req.flash("addressexsitserror", "Address Alredy Exist");

        return res.redirect("/addnewaddress");
      }

      existingUser.address.push({
        saveas: saveas,
        fullname: fullname,
        adname: adname,
        street: street,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        phonenumber: phonenumber,
      });
      await existingUser.save();
    }
    res.redirect("/userdetails");
  } catch (err) {
    console.log("add new address post method error", err);
  }
};
//=================================   EDIT ADDRESS ==================================
const editaddress = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const userData = await userModel.findById({ _id: userId });
    const address = userData.address.id(addressId);

    res.render("user/editAddress.ejs", {
      categories: categories,
      address: address,
    });
  } catch (err) {
    console.log("edit adress error:", err);
  }
};
//==================================  EDIT ADDRESS POST ==========================
const editaddresspost = async (req, res) => {
  try {
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

    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const isAddressExists = await userModel.findOne({
      _id: userId,
      address: {
        $elemMatch: {
          _id: { $ne: addressId },
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
    console.log("address exist workd", isAddressExists);

    await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.saveas": saveas,
          "address.$.fullname": fullname,
          "address.$.adname": adname,
          "address.$.street": street,
          "address.$.pincode": pincode,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.country": country,
          "address.$.phonenumber": phonenumber,
        },
      }
    );
    res.redirect("/userdetails");
  } catch (err) {
    res.status(500).send("Error Occured");
    console.log("edit address post error", err);
  }
};
//=================================   DELETE ADDRESS ===================================
const deleteaddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const data = await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      { $pull: { address: { _id: addressId } } }
    );
    console.log("the data i rendered", data);
    res.redirect("/userdetails");
  } catch (err) {
    console.log("delete address error", err);
  }
};
//========================================= PASSWORD MANAGEMENT   ======================================
const pswdmanagement = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.render("user/changePassword", { categories: categories });
  } catch (err) {
    console.log("pswdmanagement error", err);
  }
};

//=====================================   PASSWORD MANAGEMENT POST ===============================
const pswdmanagementpost = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const userId = req.session.userId;
    const oldpassword = req.body.oldPassword;
    const newpassword = req.body.newPassword;
    const confirmpassword = req.body.confirmPassword;
    const user = await userModel.findById(userId);
    const isPasswordValid = passwordValid(newpassword);
    const isCPasswordValid = confirmpasswordValid(confirmpassword, newpassword);

    const passwordMatch = await bcrypt.compare(oldpassword, user.password);

    if (passwordMatch) {
      console.log("gggggggggggggg", oldpassword, user.password);
      if (!isPasswordValid) {
        res.render("user/changePassword", {
          perror:
            "Passsword should contain atleast one Uppercase, Lowercase, Digit, Special character",
          categories: categories,
        });
      } else if (!isCPasswordValid) {
        res.render("user/changePassword", {
          cpasserror: "Password not match",
          categories: categories,
        });
      } else {
        const hashedpassword = await bcrypt.hash(newpassword, 10);
        await userModel.updateOne(
          { _id: userId },
          { password: hashedpassword }
        );
        res.redirect("/userdetails");
      }
    } else {
      res.render("user/changePassword", {
        categories: categories,
        olderror: "Incorrect Old Password",
      });
    }
  } catch (err) {
    res.status(500).send("error occured");
    console.log("post error in changin passsword from profile", err);
  }
};
//======================================== ORDER HISTORY ===============================

const orderHistory = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(userId);
    const categories = await categoryModel.find();
    const od = await orderModel.find({ userId: userId });
    const allOrderItems = [];
    od.forEach((order) => {
      allOrderItems.push(...order.items);
    });
    const orders = await orderModel.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $sort: {
          createdAt: -1, // Sort in ascending order (use -1 for descending order)
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);
    const updatedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productDetails: order.productDetails.find(
          (product) => product._id.toString() === item.productId.toString()
        ),
      })),
    }));

    res.render("user/order_history", {
      od,
      orders: updatedOrders,
      categories,
      allOrderItems,
    });
  } catch (err) {
    console.log("order history error", err);
  }
};
// =============================           SINGLE ORDER PAGE        ========================

const singleOrderPage = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await orderModel.findOne({ _id: orderId });
    const categories = await categoryModel.find();
    res.render("user/orderDetails", { categories, order });
  } catch (err) {
    console.log("orderDetails page error", err);
  }
};

//====================================   ORDER CANCELLING =================================================
const orderCancelling = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.userId;
    const update = await orderModel.updateOne(
      { _id: id },
      { status: "Cancelled" }
    );

    const result = await orderModel.findOne({ _id: id });

    if (
      result.paymentMethod == "Razorpay" ||
      result.paymentMethod == "Wallet"
    ) {
      const user = await walletModel.findOne({ userId: userId });

      const refund = result.totalPrice;

      const currentWallet = user.wallet;
      console.log(currentWallet);

      const newWallet = currentWallet + refund;
      console.log(newWallet);
      const amountUpdate = await walletModel.updateOne(
        { userId: userId },
        {
          $set: { wallet: newWallet },
          $push: {
            walletTransactions: {
              date: new Date(),
              type: "Credited", // or 'debit' depending on your use case
              amount: refund, // Replace with the actual amount you want to add
            },
          },
        }
      );
    }

    console.log("result data", result);

    const items = result.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      status: item.status,
    }));

    for (const item of items) {
      // Skip updating stock for items that are already cancelled
      if (item.status !== "cancelled") {
        const product = await productModel.findOne({ _id: item.productId });
        console.log("dd");
        product.stock += item.quantity;
        console.log(product.stock);
        await product.save();
        console.log("kk");
      }
    }
    res.redirect("/orderHistory");
  } catch (err) {
    console.log("ORDER CANCEL EROOR", err);
  }
};

// ============================     ORDER RETURNUNG  ==========================
const orderreturning = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const update = await orderModel.updateOne(
      { _id: id },
      { status: "Returned" }
    );
    const order = await orderModel.findOne({ _id: id });
    console.log("dddddddddddd", order);
    const user = await walletModel.findOne({ userId: userId });
    const refund = order.totalPrice;
    console.log("reeeeeeefund", refund);
    const currentWallet = user.wallet;
    const newWallet = currentWallet + refund;
    const amountUpdate = await walletModel.updateOne(
      { userId: userId },
      {
        $set: { wallet: newWallet },
        $push: {
          walletTransactions: {
            date: new Date(),
            type: "Credited",
            amount: refund,
          },
        },
      }
    );

    const items = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      status: item.status,
    }));

    for (const item of items) {
      if (item.status !== "Returned") {
        const product = await productModel.findOne({ _id: item.productId });
        product.stock += item.quantity;
        await product.save();
      }
    }
    res.redirect("/orderHistory");
  } catch (err) {
    console.log("order returning error", err);
  }
};
//==================== ITEM CANCELLING =======================
const itemCancelling = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });
    const singleItem = order.items.find((item) => item.productId == productId);
    console.log("llllll", singleItem);

    if (!singleItem) {
      return res.status(404).send("Item is not found!!");
    }

    if (order.paymentMethod == "Razorpay" || order.paymentMethod == "Wallet") {
      const user = await walletModel.findOne({ userId: userId });
      const refund = singleItem.price ;

      const currentWallet = user.wallet;
      const newWallet = currentWallet + refund;

      await walletModel.updateOne(
        { userId: userId },
        {
          $set: { wallet: newWallet },
          $push: {
            walletTransactions: {
              date: new Date(),
              type: "Credited",
              amount: refund,
            },
          },
        }
      );
    }

    await orderModel.updateOne(
      {
        _id: orderId,
        "items.productId": singleItem.productId,
      },
      {
        $set: {
          "items.$.status": "cancelled",
          totalPrice: order.totalPrice - singleItem.price,
          updatedAt: new Date(),
        },
      }
    );

    const product = await productModel.findOne({
      _id: singleItem.productId,
    });

    product.stock += singleItem.quantity;
    await product.save();
    console.log("reaminging canccel working??");
    const remainingNotCancelled = order.items.filter(
      (item) => item.status !== "cancelled"
    );
    console.log("items remainging cancel", remainingNotCancelled);
    if (remainingNotCancelled.length < 2) {
      order.status = "Cancelled";
      await order.save();
      console.log("its working: all items cancelled, main status updated");
    }

    res.redirect(`/singleOrder/${orderId}`);
  } catch (error) {
    console.log("error cancelling single product", error);
    res.status(404).send("error cancelling single product");
  }
};

//===========================================   ITEM RETURNUNG ============================
const itemreturintg = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });
    const singleItem = order.items.find((item) => item.productId == productId);
    const user = await walletModel.findOne({ userId: userId });
    console.log("singel itemeeee", singleItem);
    if (!singleItem) {
      return res.status(404).send("Item not found!");
    }

    const refund = singleItem.price ;
    console.log("refundeeeeee", refund);

    const currentWallet = user.wallet;
    const newWallet = currentWallet + refund;
    const amountUpdate = await walletModel.updateOne(
      { userId: userId },
      {
        $set: { wallet: newWallet },
        $push: {
          walletTransactions: {
            date: new Date(),
            type: "Credited",
            amount: refund,
          },
        },
      }
    );

    await orderModel.updateOne(
      {
        _id: orderId,
        "items.productId": singleItem.productId,
      },
      {
        $set: {
          "items.$.status": "Returned",
          totalPrice: order.totalPrice - singleItem.price,
          updatedAt: new Date(),
        },
      }
    );
    const product = await productModel.findOne({
      _id: singleItem.productId,
    });
    product.stock += singleItem.quantity;
    await product.save();

    const remainingNotreturned = order.items.filter(
      (item) => item.status !== "Returned"
    );

    if (remainingNotreturned.length < 2) {
      order.status = "Returned";
      await order.save();
    }
    res.redirect(`/singleOrder/${orderId}`);
  } catch (err) {
    console.log("item returnuing error", err);
  }
};

///==============================       WALLET          ============================
const wallet = async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await categoryModel.find();
    let user = await walletModel
      .findOne({ userId: userId })
      .sort({ "walletTransactions.date": -1 });
    if (!user) {
      user = await walletModel.create({ userId: userId });
    }

    const userWallet = user.wallet;
    const usertransactions = user.walletTransactions.reverse();

    res.render("user/wallet", {
      categories: categories,
      userWallet,
      usertransactions,
    });
  } catch (err) {
    console.log("wallet error", err);
  }
};

// ================================= WALLET TOPUP =============================
const wallettopup = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const wallet = await walletModel.findOne({ userId: userId });
    const Amount = parseFloat(req.body.Amount);
    console.log(Amount);

    wallet.wallet += Amount;
    wallet.walletTransactions.push({
      type: "Credited",
      amount: Amount,
      date: new Date(),
    });
    await wallet.save();
    res.redirect("/wallet");
  } catch (err) {
    console.log("wallet topup erorr", err);
  }
};
// ===========================    WALLET UPI INSTANCE     ================
const walletUpi = async (req, res) => {
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


//==================================   OUPONS & REWARDS   =================================
const couponsAndRewards = async(req,res)=>{
  try{
    const categories = await categoryModel.find();
    const userId = req.session.userId;
    const user = await userModel.findOne({_id:userId});
    const uniqueID = user.uniqueID;
    console.log(uniqueID,"unique id");
    const coupons = await couponModel.find({})

    res.render("user/rewardpage",{categories:categories,coupons:coupons,referralCode:uniqueID})

  }
  catch(err){
    console.log("coupons and re4ward page error",err);
  }
}


//=============================================== INVOICE ================================================
const downloadinvoice = async(req,res)=>{
try{
  const orderId = req.params.orderId;
  console.log("orderID:",orderId);
  const order = await orderModel.findOne({ orderId: orderId }).populate({
    path: "items.productId",
    select: "name",
  });
  console.log("hyy",order);
  const pdfBuffer = await generateInvoice(order);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    ` attachment; filename=invoice-${order.orderId}.pdf`
  );
  res.send(pdfBuffer);
}
catch(err){
  console.log("download invoice error",err);
}
} 


//=================================================================
const generateInvoice = async(order)=>{
  try{
    let totalAmount = order.totalPrice;
    const data = {
      documentTitle: "Invoice",
      currency: "INR",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      sender: {
        company: "TimeZone",
        address: "123 Main Street, Banglore, India",
        zip: "651323",
        city: "Banglore",
        country: "INDIA",
        phone: "9876543210",
        email: "timezoneofficial18@gmail.com",
        website: "www.timezone.shop",
      },
      invoiceNumber: `INV-${order.orderId}`,
      invoiceDate: new Date().toJSON(),
      products: order.items.map((item) => ({
        quantity: item.quantity,
        description: item.productName,
        price: item.price,
      })),
      total: `₹${totalAmount.toFixed(2)}`,
      tax: 0,
      bottomNotice: "Thank you for shopping at TimeZone!",
    };

    const result = await easyinvoice.createInvoice(data);
    const pdfBuffer = Buffer.from(result.pdf, "base64");

    return pdfBuffer;
  }
  catch(err){
    console.log("invoice genreating error",err);
  }
} 
module.exports = {
  userdetials,
  editprofile,
  updateprofile,
  addnewaddress,
  editaddress,
  addnewaddresspost,
  deleteaddress,
  editaddresspost,
  pswdmanagement,
  pswdmanagementpost,
  orderHistory,
  orderCancelling,
  orderreturning,
  itemCancelling,
  itemreturintg,
  singleOrderPage,
  wallet,
  wallettopup,
  walletUpi,
  couponsAndRewards,
  downloadinvoice,

};
