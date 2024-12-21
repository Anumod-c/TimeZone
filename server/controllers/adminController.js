const bcrypt = require('bcryptjs')
const userModel = require("../models/usermodel");
const categoryModel = require("../models/categorymodel");
const orderModel = require("../models/ordermodel");
const path = require('path')
const fs = require("fs");
const os = require("os");
const puppeteer = require("puppeteer");

//=============================================   admin login    =================================================
const adlogin = (req, res) => {
  try {
   
    res.render("admin/adlogin");
  } catch (err) {
    console.loglog("login error", err);
    res.render("user/serverError")  

  }
};

//==============================================   admin post    ===================================================
const adloginpost = async (req, res) => {
  try {
    const email = req.body.email;
    
    const user = await userModel.findOne({ email: email });
    const passowrdmatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
 
    if (passowrdmatch && user.isAdmin) {
      
      req.session.isadAuth = true;
      res.redirect("/admin/adminpannel");
    } else {
      res.render("admin/adlogin", {
        passworderror: "Invalid Password or email",
      });
    }
  } catch (err) {
    console.log("login post error", err);
    res.render("admin/adlogin", { passworderror: "Invalid Password or email" });
  }
};

//==================================================admin pannel===================================================
const adminpannel = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      res.render("admin/adminPannel");
    }
  } catch (err) {
    console.log("pannel error", err);
    res.render("user/serverError")  

  }
};
//=================================================userlisting=====================================================
const userlist = async (req, res) => {
  try {
    const users = await userModel.find({ isAdmin: false });
   
    res.render("admin/users_list", { users: users });
  } catch (err) {
    console.log(err, "listing error");
    res.render("user/serverError")  

  }
};

//==============================================admin blocking===================================================
const userupdate = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.status = !user.status;
    if (user.status) {
      req.session.isAuth = false;
    }
   
    await user.save();
    res.redirect("/admin/userslist");
  } catch (err) {
    console.log(err, "USER UPDATE ERROR");
    res.render("user/serverError")  

  }
};

//==============================================>  admin user search   <============================================

const searchuser = async (req, res) => {
  try {
    const searchName = req.body.search;
    const data = await userModel.find({
      firstname: { $regex: new RegExp(`^${searchName}`, `i`) },
    });
    req.session.searchuser = data;
    res.redirect("/admin/searchview");
  } catch (err) {
    console.log("search error", err);
    res.render("user/serverError")  

  }
};

//===============================================    search view     =========================================
const searchview = async (req, res) => {
  try {
    const user = req.session.searchuser;
    res.render("admin/users_list", { users: user });
  } catch (err) {
    console.log("searchview error", err);
    res.render("user/serverError")  

  }
};

//============================================     User Sort   ====================================================

const filter = async (req, res) => {
  try {
    const options = req.params.options;
    if (options === "A-Z") {
      user = await userModel.find().sort({ firstname: 1 });
    } else if (options === "Z-A") {
      user = await userModel.find().sort({ firstname: -1 });
    } else if (options === "Blocked") {
      user = await userModel.find({ status: true });
    } else {
      user = await userModel.find();
    }
    res.render("admin/users_list", { users: user });
  } catch (err) {
    console.log("SORT ERROR", err);
    res.render("user/serverError")  

  }
};

//============================================ADMIN CATOGORY============================================
const category = async (req, res) => {
  try {
    const category = await categoryModel.find();
    res.render("admin/categories", { cat: category });
  } catch (err) {
    console.log("catogory error", err);
    res.render("user/serverError")  

  }
};

//==============================================ADDING NEW CATEGORIES PAGE======================
const newcat = (req, res) => {
  try {
    res.render("admin/addcategories");
  } catch (err) {
    console.log("new cat error", err);
    res.render("user/serverError")  

  }
};

//===============================ADDIN CATGEGORIES POST METHOD==========================================

const addcategory = async (req, res) => {
  try {
    const catname = req.body.categoryName;
    const catdescription = req.body.description;
    const  offer = req.body.offer;
    
    const categoryexist = await categoryModel.findOne({ name: catname });
    if (categoryexist) {
      res.render("admin/addcategories", {
        caterror: "Categories alredy exist",
      });
    } else {
      
      await categoryModel.create({
        name: catname,
        offer:offer,
        description: catdescription,
      });
    
      res.redirect("/admin/Category");
    }
  } catch (err) {
    console.log("addcat post method error", err);
    res.render("user/serverError")  

  }
};

//================================================EDIT CATEGORY======================
const updatecat = async (req, res) => {
  try {
    const id = req.params.id;
    const cat = await categoryModel.findOne({ _id: id });
    res.render("admin/updatecat", { itemcat: cat });
  } catch (err) {
    console.log("editing categories error");
    res.render("user/serverError")  

  }
};

//======================================     UPDATE CATEGORY POST =================================

const updatecatpost = async (req, res) => {
  try {
    const id = req.params.id;
    const catname = req.body.categoryName;
    const catdes = req.body.description;
    const offer  = req.body.offer;
    await categoryModel.updateOne(
      { _id: id },
      { $set: { name: catname,offer:offer, description: catdes } }
    );
    res.redirect("/admin/category");
  } catch (err) {
    console.log("cat post error", err);
    res.render("user/serverError")  

  }
};

//========================================      UNLIST   ==========================================================
const unlistcat = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await categoryModel.findOne({ _id: id });
    category.status = !category.status;
    await category.save();
    res.redirect("/admin/category");
  } catch (err) {
    console.log("listing error", err);
    res.render("user/serverError")  

  }
};
//=========================================    ADMIN LOGOUT    ==================================================

const adlogout = (req, res) => {
  try {
    req.session.isadAuth = false;
    req.session.destroy();
    res.redirect("/admin");
  } catch (err) {
    console.log("LOGOUT ERROR", err);
    res.render("user/serverError")  

  }
};

//=====================================      SALES AND  GRAPH  ===================================
const chartData = async (req, res) => {
  try {
    const selected = req.body.selected;
    if (selected == "month") {
      const orderByMonth = await orderModel.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const salesByMonth = await orderModel.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
            },
            totalAmount: { $sum: "$totalPrice" },
          },
        },
      ]);
      const responseData = {
        order: orderByMonth,
        sales: salesByMonth,
      };

      res.status(200).json(responseData);
    } else if (selected == "year") {
      const orderByYear = await orderModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const salesByYear = await orderModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
            },
            totalAmount: { $sum: "$totalPrice" },
          },
        },
      ]);
      const responseData = {
        order: orderByYear,
        sales: salesByYear,
      };
      res.status(200).json(responseData);
    }
  } catch (err) {
    console.log("sale error", err);
    res.render("user/serverError")  

  }
};

//======================================  DOWNLOAD SALES  =========================================
const downloadsales = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    

    const salesData = await orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate + "T23:59:59.999Z")
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);
    
    const products = await orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate + "T23:59:59.999Z")

          },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          productName: "$productDetails.name",
        },
      },
      {
        $sort: { totalSold: -1 },
      },
    ]);

    
    const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sales Report</title>
                <style>
                    body {
                        margin-left: 20px;
                    }
                </style>
            </head>
            <body>
                <h2 align="center"> Sales Report</h2>
                Start Date:${startDate}<br>
                End Date:${endDate}<br> 
                <center>
                    <table style="border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #000; padding: 8px;">Sl N0</th>
                                <th style="border: 1px solid #000; padding: 8px;">Product Name</th>
                                <th style="border: 1px solid #000; padding: 8px;">Quantity Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products
                              .map(
                                (item, index) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 8px;">${
                                      index + 1
                                    }</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${
                                      item.productName
                                    }</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${
                                      item.totalSold
                                    }</td>
                                </tr>`
                              )
                              .join("")}
                                <tr>
                                <td style="border: 1px solid #000; padding: 8px;"></td>
                                <td style="border: 1px solid #000; padding: 8px;">Total No of Orders</td>
                                <td style="border: 1px solid #000; padding: 8px;">${
                                  salesData[0].totalOrders
                                }</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 8px;"></td>
                                <td style="border: 1px solid #000; padding: 8px;">Total Revenue</td>
                                <td style="border: 1px solid #000; padding: 8px;">${
                                  salesData[0].totalAmount
                                }</td>
                            </tr>
                        </tbody>
                    </table>
                </center>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({ headless: "new" });

    const page = await browser.newPage();
    await page.setContent(htmlContent);

    
    const pdfBuffer = await page.pdf();

    await browser.close();

    const downloadsPath = path.join(os.homedir(), "Downloads");
    const pdfFilePath = path.join(downloadsPath, "sales.pdf");

   
    fs.writeFileSync(pdfFilePath, pdfBuffer);

    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales.pdf");
    res.status(200).end(pdfBuffer);
  } catch (err) {
    console.log(err,"download error");
    res.render("user/serverError")  

    
  }
};


//=========================================================================================================
module.exports = {
  adlogin,
  adloginpost,
  adminpannel,
  userlist,
  userupdate,
  searchuser,
  searchview,
  filter,

  category,
  newcat,
  addcategory,
  updatecat,
  updatecatpost,
  unlistcat,
  chartData,
  downloadsales,

  adlogout,
};
