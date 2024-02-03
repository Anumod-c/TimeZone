const orderModel = require('../models/ordermodel')






const orderPage = async (req, res) => {
    try {
        const ITEMS_PER_PAGE = 5; // Number of orders per page
        const page = parseInt(req.query.page) || 1; // Get the current page from query parameters

        const options = {
            page: page,
            limit: ITEMS_PER_PAGE,
            sort: { totalPrice: -1 } // Sort by totalPrice in descending order
        };

        const orders = await orderModel.paginate({}, options);

        res.render('admin/orderPage', { orderdata: orders.docs, pageCount: orders.totalPages, currentPage: orders.page });
    } catch (err) {
        console.log(err);
        return res.status(400).send('Error Occurred');
    }
};

//////////////////////////////////////////////

const orderDetails=async(req,res)=>{
    try {
        
        const id=req.params.id
        const order=await orderModel.findById(id)
        res.render("admin/orderDetail",{orders:order})
    } catch (error) {
        
    }
}



const updateOrderStatus=async(req,res)=>{
    try{
        const getStatusIndex =(status)=>{
            const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];
            return statuses.indexOf(status)
        }
        
        const { orderId, status } = req.body;

        const currentOrder = await orderModel.findById(orderId);
        if(!currentOrder){
           
            return res.status(404).json({error:'Order not found'});
            
        }
        if(getStatusIndex(status)< getStatusIndex(currentOrder.status)){
          

            return res.status(400).json({error:'Invalid status update'})
        }

        
        
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
        else if(status=="Pending" ){
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
        else if(status=="Returned"){
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
    orderDetails
    


}