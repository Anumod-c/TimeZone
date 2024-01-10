const mongoose =require('mongoose');

const favSchema =new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userdetails',
    },
    sessionId:String,
    item: [
        {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true,
        },
        price: {
            type: Number,
            required:true,
            
        
        },
        
        },
    ],

  });
  
 const favModel = mongoose.model('favourites', favSchema);
  
  module.exports = favModel;