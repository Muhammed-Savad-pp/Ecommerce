const product = require("../model/product_model");
const Cart = require("../model/cart_model");
const user = require("../model/user_model");
const mongoose = require("mongoose");
const { ObjectId } = require("bson");
const { log } = require("npmlog");
const Address = require("../model/address_model");
const Order = require('../model/order_model');

function generateOrderID() {
  const min = 10000000; 
  const max = 99999999; 

  const orderId = Math.floor(Math.random() * (max - min + 1)) + min;

  return orderId;
}

const cartLoad = async (req, res) => {
  try {
    const userid = req.session.user_id;

    if (userid) {
      const cartsdata = await Cart.findOne({ userId: userid }).populate(
        "product.productId"
      );
      //console.log('cartsdata ',cartsdata);

      if (cartsdata && cartsdata.product.length > 0) {
        const total = cartsdata.product.reduce((acc, productItem) => {
          if (productItem.productId && productItem.productId.price) {
            const price = Number(productItem.productId.price);

            if (!isNaN(price)) {
              return acc + price * productItem.quantity;
            }
          }
          return acc;
        }, 0);

        const totalCartAmount = await Cart.findOneAndUpdate(
          { userId: userid },
          { $set: { total: total } },
          { new: true, upsert: true }
        );
        //console.log(total+'total')
        res.render("cart", { cartsdata: cartsdata });
      } else {
        console.log("No products found in cart");
        res.render("cart", { cartsdata: cartsdata });
      }
    } else {
      console.log("User ID not found in session");
      res.render("login", { cartsdata: null });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addcart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productId = req.body.productId;

    const cart = await Cart.findOne({ userId: userid });
    const produt = await product.findOne({ _id: productId });
    //console.log(produt,"produt");

    if (cart) {
      const ExistsCartProduct = await Cart.findOne({
        userId: userid,
        "product.productId": productId,
      });

      if (ExistsCartProduct) {
        return res
          .status(400)
          .json({ success: false, message: "Product already in cart" });
      } else {
        cart.product.push({ productId });
        await cart.save();
      }
    } else {
      const cart = new Cart({
        userId: userid,
        product: [{ productId: productId }],
      });

      await cart.save();
    }
    res
      .status(200)
      .json({ success: true, message: "Product added to cart successfully" });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to add product to cart1" });
  }
};

const updateQuantity = async (req, res) => {
    const userId = req.session.user_id;
    const { productId, quantity } = req.body;
    console.log(productId, quantity, "hello");
    try {
      const products = await product.findById({ _id: productId });
      console.log(products.quantity);
  
      if (!products) {
          console.log("1")
        return res.status(404).json({ error: "Product not found" });
      }
  
      
  
      await Cart.findOneAndUpdate(
        { userId: userId, "product.productId": productId },
        { $set: { "product.$.quantity": quantity } },
        { new: true }
      );
  
      res.status(200).json({ success: true, message: "Cart quantity updated successfully" });
  
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

const deleteproductfromcart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productid = req.body.productId;

    // console.log('userid', userid);
    // console.log('productid', productid,typeof(productid) );

    await Cart.findOneAndUpdate(
      { userId: userid },
      { $pull: { product: { productId: productid } } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const loadcheckoutpage = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const addressdata = await Address.findOne({ userId: userid });

    const cartdata = await Cart.findOne({ userId: userid }).populate(
      "product.productId"
    );

    let totalamount = 0;
    cartdata.product.forEach((item) => {
      const { productId, quantity } = item;
      if (productId && productId.price) {
        const subtotal = productId.price * quantity;
        totalamount += subtotal;
      }
    });

    res.render("checkoutpage", { addressdata, totalamount });
  } catch (error) {
    console.log(error.message);
  }
};


const checkQuantityInStock = async(req,res)=>{

  try {
    
    const userid = req.session.user_id;
    const  carts = await Cart.findOne({userId:userid}).populate('product.productId')
    
    let outOfStockProducts = [];

    if(carts){

      for(const item of carts.product){

        const product = item.productId;

          if(product.quantity <= 0){

            outOfStockProducts.push(product.name)

          }else{
            console.log('else');
          }
      }
      
      const  cartsProduct = carts.product;

      if(cartsProduct.length <= 0){

        res.status(400).json({success:false, message:'No products in cart'})
      }
      else if(outOfStockProducts.length > 0){
       
        res.status(400).json({success:false, message:'Products is out of Stock, please remove product'})
      }else{
        res.json({success:true})
      }
      

    } 

  } catch (error) {
    console.log(error.message);
  }

}


const AddAddressFromCheckout = async (req, res) => {
  try {
    const userid = req.session.user_id;

    const { name, city, district, state, country, mno, pincode } = req.body;

    //console.log(name, city, district, state, country, mno, pincode);

    const address = await Address.findOne({ userId: userid });

    if (address) {
      address.address.push({
        name: name,
        city: city,
        district: district,
        state: state,
        country: country,
        mobile: mno,
        pincode: pincode,
      });
      await address.save();
      res.redirect("/checkout");
    } else {
      const address = new Address({
        userId: userid,
        address: [
          {
            name: name,
            city: city,
            district: district,
            state: state,
            country: country,
            mobile: mno,
            pincode: pincode,
          },
        ],
      });

      await address.save();

      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadChecoutEditAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const id = req.query.id;

    const addressData = await Address.findOne({
      userId: userId,
      "address._id": id,
    });

    if (addressData) {
      const foundAddress = addressData.address.find(
        (addr) => addr._id.toString() === id
      );

      if (foundAddress) {
        res.render("checkoutaddressedit", { address: foundAddress });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateAddressFromCheckout = async (req, res) => {
  try {
    const { name, city, district, state, country, mobile, pincode } = req.body;
    const userid = req.session.user_id;
    const addressid = req.body.id;

    const addressData = await Address.findOne({
      userId: userid,
      "address._id": addressid,
    });

    if (addressData) {
      const foundAddress = addressData.address.find(
        (addr) => addr._id.toString() === addressid
      );

      if (foundAddress) {
        const updateAddress = await Address.findOneAndUpdate(
          { userId: userid, address: foundAddress },

          {
            $set: {
              "address.$.name": name,
              "address.$.city": city,
              "address.$.district": district,
              "address.$.state": state,
              "address.$.country": country,
              "address.$.mobile": mobile,
              "address.$.pincode": pincode,
            },
          },

          { new: true }
        );

        if (updateAddress) {
          res.status(200).json({ success: true });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadOrder = async(req,res)=>{

  try {

    const userid = req.session.user_id;
    const orderdata = await Order.findOne({userId:userid})
    res.render('order',{orderdata:orderdata})

  } catch (error) {
    console.log(error.message);
  }

}


const orderProducts = async(req,res)=>{

  try {

    const paymentMethod = req.body.paymentMethod;
    const addressIndex = req.body.addressId;
    const userid = req.session.user_id;
    const addressData = await Address.findOne({userId:userid})
    const cartsData = await Cart.findOne({userId:userid}).populate('product.productId');
    const orderid = generateOrderID();
    
 

    let outOfStockProducts = [];

    if(cartsData){
      for(const item of cartsData.product){

        const product = item.productId;

          if(product.quantity <= 0){

            outOfStockProducts.push(product.name)

          }
      }
    }

    if(outOfStockProducts.length > 0){
       
      res.status(400).json({success:false, message:'Products is out of Stock, please remove product'})
       
    }else{

      const items = [];
      let totalAmount = 0;

      for(const item of cartsData.product){

        const oneProduct  = await product.findById(item.productId);

        const itemDetails = {

          productId:item.productId,
          quantity:item.quantity,
          categoryId:oneProduct.category,
          price:oneProduct.price
          
        }

        items.push(itemDetails);
        totalAmount += oneProduct.price * item.quantity;
        oneProduct.quantity -= item.quantity;
        await oneProduct.save();

      }

      await Cart.findOneAndUpdate({userId:userid},{product:[]});

      const newOrder = new Order({

        userId:userid,
        items:items,
        totalAmount:totalAmount,
        address: addressData.address[addressIndex],
        paymentMethod:paymentMethod,
        orderId:orderid
      })

      await newOrder.save();

      res.status(200).json({success:true})  
      
    }


    
  } catch (error) {
    console.log(error.message);
  }

}




module.exports = {
  cartLoad,
  addcart,
  updateQuantity,
  deleteproductfromcart,
  loadcheckoutpage,
  AddAddressFromCheckout,
  loadChecoutEditAddress,
  updateAddressFromCheckout,
  checkQuantityInStock,
  orderProducts,
  loadOrder
};
