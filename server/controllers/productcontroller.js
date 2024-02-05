const mongoose =require('mongoose')
const path =require('path');
const productModel=require('../models/productmodel');
const categoryModel=require('../models/categorymodel');
const fs= require('fs');
const couponModel = require('../models/couponModel');

const product = async (req, res) => {
    try {
        const page = req.query.page || 1; // Extract page from request query parameters
        const perPage = 4  ; // Adjust per your pagination settings

        const options = {
            page: page,
            limit: perPage,
            populate: {
                path: 'categories',
                select: 'name'
            }
        };

        const products = await productModel.paginate({}, options);

        res.render('admin/product', { 
            products: products.docs,
            pageCount: products.totalPages,
            currentPage: products.page 
        });
    } catch (err) {
        console.log('product rendering error', err);
        res.render("user/serverError")  
    }
};

//==============================         adding product page    ================================================
const newproduct = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.render('admin/newproduct', { categories: categories });
    } catch (error) {
        console.log('new product page error', error);
        res.render("user/serverError")  

    }
}

//===================================         addproduct post      ===============================================
const addproduct = async (req, res) => {
    try {
        const { productName, categories, images, mrp, discount,price, stock, descriptions, dialcolour, strapcolour, framematerial, strapmaterial, dimensions, manufacture } = req.body;

        const newproduct = await productModel.create({
            name: productName,
            categories: categories,
            // type: productType, ==> can be useful when veiwng similar products in sigle product page
            images: req.files.map(file => file.path),
            mrp: mrp,
            discount:discount,
            price: price,
            stock: stock,
            descriptions: descriptions,
            dialcolour: dialcolour,
            strapcolour: strapcolour,
            framematerial: framematerial,
            strapmaterial: strapmaterial,
            dimensions: dimensions, 
            manufacture: manufacture
        });

        await newproduct.save();
        res.redirect('/admin/product');
    } catch (err) {
        console.log('add product post error', err);
        res.render("user/serverError")  

    }
}


//================================       LISTING AND UNLISTING        ===================================
const unlist =async(req,res)=>{
    try{
        const id =req.params.id;
        const product = await productModel.findOne({_id:id})
        product.status=!product.status;
        await product.save();
        res.redirect('/admin/product');
    }
    catch(err){
        console.log('product listing/unlisting error',err);
        res.render("user/serverError")  

    }
}

//====================================           UPDATE PRODUCT         =========================================
const updateproduct=async(req,res)=>{
    try{
        const id=req.params.id;
    const product =await productModel.findOne({_id:id})
    res.render('admin/updateproduct',{product:product})
    }
    catch(err){
        console.log('update product rendering',err);
        res.render("user/serverError")  

    }
}

//=======================================       UPDATE IMG       ===========================================
const editimage =async(req,res)=>{
    try{
        const id=req.params.id;
        const products=await productModel.findOne({_id:id});
        res.render('admin/editimage',{products:products})
    }
    catch(err){
        console.log('edit img error',err);
        res.render("user/serverError")  
    }
}

//===========================================     EDIT IMAGE POST      ============================================
const editimagepost =async(req,res)=>{
    try{
        const id = req.params.id;
        const newimg =req.files.map(file=>file.path);
        const products =await productModel.findOne({_id:id});
        products.images.push(...newimg);
        products.save();
        res.redirect('/admin/product')
    }
    catch(err){
        console.log('edit image post error',err);
        res.render("user/serverError")  

    }
}
//========================================           DELETE IMAGE     ====================================
const delimage=async(req,res)=>{
    try{
        const pid = req.query.pid;
        const filename=req.query.filename;
        if(fs.existsSync(filename)){
            try{
                fs.unlinkSync(filename);
                console.log('image deleting worked');
                res.redirect('/admin/product');
                await productModel.updateOne({_id:pid},{$pull:{images:filename}})

            }
            catch(err){
                console.log(' frt try block delete image error',err);
            }
        }
        else{
            console.log('Images not found');
        }
    } 
    catch(err){
        console.log(' second try block delete img error',err);
    }
}


//=============================UPDATE PRODUCT POST=======================
    const updateproductpost= async(req,res)=>{
        try{
            const id=req.params.id;
            const { productName, categories, mrp,discount, price, stock, descriptions, dialcolour, strapcolour, framematerial, strapmaterial, dimensions, manufacture } = req.body;
            await productModel.updateOne(
                { _id: id },
                {
                    $set: {
                        name: productName,
                        categories: categories,
                        mrp: mrp,
                        discount:discount,
                        price: price,
                        stock: stock,
                        descriptions: descriptions,
                        dialcolour: dialcolour,
                        strapcolour: strapcolour,
                        framematerial: framematerial,
                        strapmaterial: strapmaterial,
                        dimensions: dimensions,
                        manufacture: manufacture
                    }
                },
            );
    
            
            res.redirect('/admin/product');
        } catch (err) {
            console.log('update productpost error', err);
            res.render("user/serverError")  

        }
    }
    //================================DELETE PRODUCT==========================================
    const delproduct =async(req,res)=>{
        try{
            const id=req.params.id;
            const products=await productModel.deleteOne({_id:id})
            
            res.redirect('/admin/product')                                ///NOT COMPLETE need to add js
        }
        catch(err){
            console.log('delete product error',err);
            res.render("user/serverError")  

        }
    }
//======================================================== EXPORTING ============================
module.exports={
    product,
    newproduct,
    addproduct,

    unlist,
    updateproduct,
    editimage,
    delimage,
    editimagepost,
    updateproductpost,
    delproduct,





}