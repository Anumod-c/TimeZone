const orderModel = require('../models/ordermodel')



const orderPage=async (req,res)=>{
    try{
        const orders=await orderModel.find({}).sort({ createdAt: -1 })
    res.render("admin/orderPage",{orderdata:orders})
}
catch (err) {
    console.log(err);
    res.render("users/serverError")
}
}



const updateOrderStatus=async(req,res)=>{
    try{
        
        const { orderId, status } = req.body;
        
        const updatedOrder = await orderModel.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: status ,updatedAt:Date.now()}},
            { new: true }
        );
      

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

    
        res.redirect('/admin/orderPage'); 

    }
    catch (err) {
        console.log(err);
    }
}




const filterOrder=async (req,res)=>{
    try{
        const status=req.params.status
        // let condition ={ }
        if(status=="All"){
            const orders=await orderModel.find({}).sort({ createdAt: -1 })
            res.render("admin/orderPage",{orderdata:orders})
        }
        else if(status=="Pending"){
            const orders=await orderModel.find({status:status}).sort({ createdAt: -1 })
            res.render("admin/orderPage",{orderdata:orders})
        }
        else if(status=="Processing"){
            const orders=await orderModel.find({status:status}).sort({ createdAt: -1 })
            res.render("admin/orderPage",{orderdata:orders})
        }
        else if(status=="Shipped"){
            const orders=await orderModel.find({status:status}).sort({ createdAt: -1 })
            res.render("admin/orderPage",{orderdata:orders})
        }
        else if(status=="Delivered"){
            const orders=await orderModel.find({status:status}).sort({ createdAt: -1 })
            res.render("admin/orderPage",{orderdata:orders})
        }
        else if(status=="Cancelled"){
            const orders=await orderModel.find({status:status}).sort({ createdAt: -1 })
            res.render("admin/orderPage",{orderdata:orders})
        }
        else if(status=="returned"){
            const orders=await orderModel.find({status:status}).sort({ createdAt: -1 })
            res.render("admin/orderPage",{orderdata:orders})
        }
    }
    catch(err){
        console.log(err);
       
    }
    }


module.exports={
    orderPage,
    updateOrderStatus,
    filterOrder,
    


}