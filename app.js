require('dotenv').config()
const flash = require("express-flash")
const express = require("express");
const session = require("express-session"); // Correct import statement
const app = express();
const mongoose=require('mongoose')
const usrouter = require("./server/router/user");
const adrouter = require("./server/router/admin");
const path = require("path");
const nocache = require("nocache");
const multer = require("multer");
const isAuth = require("./middleware/isAuth")
const PORT=process.env.PORT
const MONGO_URL=process.env.MONGO_URL

mongoose.connect(MONGO_URL)
.then( console.log("mongodb connected"))
.catch((err)=>console.log(err))

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(nocache());
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    }));

//static

app.use(isAuth.counterbadge)
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
// app.set("public",path.join(__dirname,"public/user_assets"))

//view engine\
app.set("view engine", "ejs");

//multer
app.use("/uploads", express.static("uploads"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use("/admin", adrouter);
app.use("/", usrouter);

app.get("*",(req,res)=>{
  res.render("user/404")
})

//host

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});