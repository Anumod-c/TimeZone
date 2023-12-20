const bcrypt=require('bcrypt')
const userModel=require('../models/usermodel');
const  categoryModel  = require('../models/categorymodel');
// const adrouter = require('../router/admin');



//=============================================   admin login    =================================================
const adlogin =(req,res)=>{
    try{
        console.log("adnmin rendered")
        res.render("admin/adlogin");
    }
    catch(err){
        console.loglog('login error',err)
    }
}

//==============================================   admin post    ===================================================
const adloginpost =async(req,res)=>{
    try{
        const email = req.body.email;
        console.log(email);
        const user = await userModel.findOne({email:email});
        const passowrdmatch = await bcrypt.compare(req.body.password,user.password)
        console.log("admin details:",user);
        if(passowrdmatch && user.isAdmin){
            console.log("if condition of admin checking worked");
            req.session.isadAuth =true;
            res.redirect('/admin/adminpannel')

        }
        else{
            console.log(' admin chekin else part woked');
        res.render('admin/adlogin',{passworderror:"Invalid Password or email"})
    }
}
    catch(err){
        console.log('login post error',err);
        res.render('admin/adlogin',{passworderror:"Invalid Password or email"})

    }
}


//==================================================admin pannel===================================================
const adminpannel=async(req,res)=>{
    try{
        if(req.session.isadAuth){
            res.render('admin/adminPannel')
        }
    }
    catch(err){
        console.log("pannel error",err);
    }
}
//=================================================userlisting=====================================================
const userlist =async(req,res)=>{
try{

    console.log('hyy');
    const users =await userModel.find({isAdmin:false})
    console.log(users);
    res.render('admin/users_list',{users:users})
}
catch(err)
{
    console.log(err,"listing error");
}
}

//==============================================admin blocking===================================================
const userupdate =async(req,res)=>{
    try{
        const email=req.params.email;
        const user=await userModel.findOne({email:email});
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        user.status=!user.status;
        if(user.status){
            req.session.isAuth=false;
        }
        console.log(user);
        await user.save()
        res.redirect('/admin/userslist')
        
    }
    catch(err){
        console.log(err,'USER UPDATE ERROR');
    }
}


//==============================================>  admin user search   <============================================

const searchuser =async (req,res)=>{
    try{
        const searchName=req.body.search;
        const data = await userModel.find({
            firstname:{$regex: new RegExp(`^${searchName}`,`i`)}
        });
        req.session.searchuser=data;
        res.redirect('/admin/searchview')
    }
    catch(err){
        console.log('search error',err);
    }
}

//===============================================    search view     =========================================
const searchview=async(req,res)=>{
    try{
        
        const user =req.session.searchuser;
        res.render('admin/users_list',{users:user})
        
    }
    catch(err){
        console.log('searchview error',err);
    }
}

//============================================     User Sort   ====================================================

const filter=async(req,res)=>{
    try{

    const options =req.params.options;
        if(options==='A-Z'){
            user = await userModel.find().sort({firstname:1})
        }
        else if(options==='Z-A'){
            user = await userModel.find().sort({firstname:-1})
        }
        else if(options==='Blocked'){
            user = await userModel.find({status:true})
        }
        else{
            user =await userModel.find()
        }
        res.render('admin/users_list',{users:user})
    }
    catch(err){
        console.log('SORT ERROR',err);
    }
}


//============================================ADMIN CATOGORY============================================
const category=async(req,res)=>{
    try{
        const category = await categoryModel.find()
        res.render('admin/categories',{cat:category})
    }
    catch(err){ 
        console.log('catogory error',err);
    }
}

//==============================================ADDING NEW CATEGORIES PAGE======================
const newcat =(req,res)=>{
    try{
        res.render('admin/addcategories')
    }
    catch(err){
        console.log('new cat error',err);
    }
}

//===============================ADDIN CATGEGORIES POST METHOD==========================================

const addcategory=async(req,res)=>{
    try{
        const catname=req.body.categoryName;
        const catdescription =req.body.description;
console.log('kkkkkkkkkkkkkkkkkkk',catdescription);
        const categoryexist= await categoryModel.findOne({name:catname})
        if(categoryexist){
            res.render('admin/addcategories',{caterror:'Categories alredy exist'})
        }
       
           else{
            console.log('else condition worked');
            await categoryModel.create({
                name:catname,
                description:catdescription
            })
            console.log('categoriess created')
            res.redirect('/admin/Category')
           }
        
    }
    catch(err){
        console.log('addcat post method error',err)
    }
}

//================================================EDIT CATEGORY======================
const updatecat=async(req,res)=>{
    try{
        const id=req.params.id;
        const cat =await categoryModel.findOne({_id:id})
       res.render('admin/updatecat',{itemcat:cat}) 
    }
    catch(err){
        console.log('editing categories error');
    }
}


//======================================     UPDATE CATEGORY POST =================================

const updatecatpost =async(req,res)=>{
    try{
        const id =req.params.id;
        const catname=req.body.categoryName;
        const catdes = req.body.description;
        await categoryModel.updateOne({_id:id},{$set:{name:catname,description:catdes}})
        res.redirect('/admin/category')
    }
    catch(err){
        console.log('cat post error',err);
    }
}

//=====================================UNLIST==============================
const unlistcat =async(req,res)=>{
    try{
        const id =req.params.id;
        const category =await categoryModel.findOne({_id:id});
        category.status=!category.status;
        await category.save();
        res.redirect('/admin/category')
    }
    catch(err){
        console.log('listing error',err);
    }
}
//=========================================    ADMIN LOGOUT    ==================================================


const adlogout=(req,res)=>{
    try{
        req.session.isadAuth=false;
        req.session.destroy();
        res.redirect('/admin')
        
        
    }
    catch(err){
        console.log('LOGOUT ERROR',err);
    }
}
module.exports={
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

    adlogout, 

}