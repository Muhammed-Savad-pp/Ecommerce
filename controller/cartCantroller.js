const product = require("../model/product_model");
const Cart = require("../model/cart_model");
const user = require("../model/user_model");
const mongoose = require("mongoose");
const { ObjectId } = require("bson");
const { log } = require("npmlog");
const Address = require("../model/address_model");
const Order = require("../model/order_model");
const RazorPay = require("razorpay");
const Coupen = require("../model/coupen_model");
const Wallet = require("../model/wallet_model");
const Wishilist = require("../model/wishilist_modal");
const Category = require("../model/category_model");
const { default: balanced } = require("balanced-match");

require("dotenv").config();
const instance = new RazorPay({
  key_id: process.env.RAZORPAY_IDKEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

function generateOrderID() {
  const min = 10000000;
  const max = 99999999;

  const orderId = Math.floor(Math.random() * (max - min + 1)) + min;

  return orderId;
}

const cartLoad = async (req, res) => {
  try {
    const userid = req.session.user_id;

    const wishilist = await Wishilist.findOne({ userId: userid }).populate(
      "items.productId"
    );
    const wishilistData = wishilist ? wishilist.items : [];

    if (userid) {
      const carts = await Cart.findOne({ userId: userid }).populate(
        "product.productId"
      );
      const cartsdata = carts ? carts.product : [];

      res.render("cart", { cartsdata: cartsdata, wishilistData });
    } else {
      console.log("User ID not found in session");
      res.render("login", { cartsdata: null, wishilistData });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
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
      console.log("1");
      return res.status(404).json({ error: "Product not found" });
    }

    await Cart.findOneAndUpdate(
      { userId: userId, "product.productId": productId },
      { $set: { "product.$.quantity": quantity } },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Cart quantity updated successfully" });
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

    const carts = await Cart.findOne({ userId: userid }).populate(
      "product.productId"
    );
    const cartsdata = carts ? carts.product : [];

    const wishilist = await Wishilist.findOne({ userId: userid }).populate(
      "items.productId"
    );
    const wishilistData = wishilist ? wishilist.items : [];

    const coupenData = await Coupen.find();

    let totalamount = 0;
    cartdata.product.forEach((item) => {
      const { productId, quantity } = item;
      if (productId && productId.price) {
        if (productId.offerprice != productId.price) {
          const subtotal = productId.offerprice * quantity;
          totalamount += subtotal;
        } else {
          const subtotal = productId.price * quantity;
          totalamount += subtotal;
        }
      }
    });

    res.render("checkoutpage", {
      addressdata,
      totalamount,
      coupenData,
      req: req,
      cartsdata,
      wishilistData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const checkQuantityInStock = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const carts = await Cart.findOne({ userId: userid }).populate(
      "product.productId"
    );

    let outOfStockProducts = [];

    if (carts) {
      for (const item of carts.product) {
        const product = item.productId;
88
        if (product.quantity <= 0) {
          outOfStockProducts.push(product.name);
        }
      }

      const cartsProduct = carts.product;

      if (cartsProduct.length <= 0) {
        res
          .status(400)
          .json({ success: false, message: "No products in cart" });
      } else if (outOfStockProducts.length > 0) {
        res
          .status(400)
          .json({
            success: false,
            message: "Products is out of Stock, please remove product",
          });
      } else {
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

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

    const carts = await Cart.findOne({ userId: userId }).populate(
      "product.productId"
    );
    const cartsdata = carts ? carts.product : [];

    const wishilist = await Wishilist.findOne({ userId: userId }).populate(
      "items.productId"
    );
    const wishilistData = wishilist ? wishilist.items : [];

    if (addressData) {
      const foundAddress = addressData.address.find(
        (addr) => addr._id.toString() === id
      );

      if (foundAddress) {
        res.render("checkoutaddressedit", {
          address: foundAddress,
          cartsdata,
          wishilistData,
        });
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

const loadOrder = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const orderdata = await Order.findOne({ userId: userid });

    const carts = await Cart.findOne({ userId: userid }).populate(
      "product.productId"
    );
    const cartsdata = carts ? carts.product : [];

    const wishilist = await Wishilist.findOne({ userId: userid }).populate(
      "items.productId"
    );
    const wishilistData = wishilist ? wishilist.items : [];

    res.render("order", { orderdata: orderdata, cartsdata, wishilistData });
  } catch (error) {
    console.log(error.message);
  }
};

const orderProducts = async (req, res) => {
  try {
    const paymentMethod = req.body.paymentMethod;
    const addressIndex = req.body.addressId;
    const userid = req.session.user_id;
    const addressData = await Address.findOne({ userId: userid });
    const cartsData = await Cart.findOne({ userId: userid }).populate(
      "product.productId"
    );
    const orderid = generateOrderID();
    const totalamount = req.body.totalAmount;
    const discountAmount = req.body.discountAmount;
    const paymentStatus = req.body.paymentStatus;

    let outOfStockProducts = [];

    if (cartsData) {
      for (const item of cartsData.product) {
        const product = item.productId;

        if (product.quantity <= 0) {
          outOfStockProducts.push(product.name);
        }
      }
    }

    if (outOfStockProducts.length > 0) {
      res
        .status(400)
        .json({
          success: false,
          message: "Products is out of Stock, please remove product",
        });
    } else {
      const items = [];

      for (const item of cartsData.product) {
        const oneProduct = await product.findById(item.productId);

        const itemDetails = {
          productId: item.productId,
          quantity: item.quantity,
          categoryId: oneProduct.category,
          price: oneProduct.price,
        };

        items.push(itemDetails);

        oneProduct.quantity -= item.quantity;
        oneProduct.count += item.quantity;
        await oneProduct.save();

        const category = await Category.findOne({ _id: oneProduct.category });

        category.count += item.quantity;
        await category.save();
      }

      await Cart.findOneAndUpdate({ userId: userid }, { product: [] });

      const newOrder = new Order({
        userId: userid,
        items: items,
        totalAmount: totalamount,
        address: addressData.address[addressIndex],
        paymentMethod: paymentMethod,
        orderId: orderid,
        discount: discountAmount,
        paymentStatus: paymentStatus,
      });

      const firstOrder = await Order.findOne({ userId: userid });
      const User = await user.findById(userid);
      const referedCode = User.refered;

      if (referedCode && firstOrder == undefined) {
        const CurrentUserWallet = await Wallet.findOne({ UserId: userid });

        if(CurrentUserWallet){
          CurrentUserWallet.balance += 50;
          CurrentUserWallet.history.push({
            amount: 50,
            transactionType: "Referal",
          });
          await CurrentUserWallet.save();

        }else{
          const currentuserwalet = new Wallet({
            UserId:userid,
            balance:50,
            history:[{
              amount:50,
              transactionType: "Referal"
            }]
          })

          await currentuserwalet.save()
        }

        

        const referedUser = await user.findOne({ referlCode: referedCode });
        const referedUserWallet = await Wallet.findOne({
          UserId: referedUser._id,
        });

        if(referedUserWallet){
          referedUserWallet.balance += 25;
          referedUserWallet.history.push({
            amount: 25,
            transactionType: "Referal",
          });
          await referedUserWallet.save();

        }else{
          const wallet = new Wallet({
            UserId:referedUser._id,
            balance:25,
            history:[{
              amount:25,
              transactionType: "Referal"
            }]
          })

          await wallet.save()
        }
      
      } else {
        console.log("not working");
      }
      await newOrder.save();
      req.session.minprice = null;
      req.session.discount = null;
      req.session.coupenCode = null;
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const razorpayment = async (req, res) => {
  try {
    const users = await user.findOne({ _id: req.session.user_id });
    const amount = req.body.totalAmountInPaise;
    console.log(amount);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "savad3517@gmail.com",
    };

    instance.orders.create(options, (err, order) => {
      if (!err) {
        res.send({
          succes: true,
          msg: "ORDER created",
          orderid: order.id,
          amount: amount,
          key_id: process.env.RAZORPAY_IDKEY,
          name: users.name,
          email: users.email,
        });
      } else {
        console.error("Error creating order:", err);
        res.status(500).send({ success: false, msg: "Failed to create order" });
      }
    });
  } catch (error) {
    console.log("error from razopay :", error.message);
  }
};

const WalletOrderPayment = async (req, res) => {
  try {
    const paymentMethod = req.body.paymentMethod;
    const addressIndex = req.body.addressId;
    const userid = req.session.user_id;
    const addressData = await Address.findOne({ userId: userid });
    const cartsData = await Cart.findOne({ userId: userid }).populate(
      "product.productId"
    );
    const orderid = generateOrderID();
    const totalamount = req.body.totalAmount;
    const discountAmount = req.body.discountAmount;

    let outOfStockProducts = [];

    if (cartsData) {
      for (const item of cartsData.product) {
        const product = item.productId;

        if (product.quantity <= 0) {
          outOfStockProducts.push(product.name);
        }
      }
    }

    if (outOfStockProducts.length > 0) {
      res
        .status(400)
        .json({
          success: false,
          message: "Products is out of Stock, please remove product",
        });
    } else {
      const items = [];

      for (const item of cartsData.product) {
        const oneProduct = await product.findById(item.productId);

        const itemDetails = {
          productId: item.productId,
          quantity: item.quantity,
          categoryId: oneProduct.category,
          price: oneProduct.price,
        };

        items.push(itemDetails);

        oneProduct.quantity -= item.quantity;
        oneProduct.count += item.quantity;
        await oneProduct.save();

        const category = await Category.findOne({ _id: oneProduct.category });

        category.count += item.quantity;
        await category.save();
      }

      await Cart.findOneAndUpdate({ userId: userid }, { product: [] });

      var wallet = await Wallet.findOne({ UserId: userid });

      if (totalamount <= wallet.balance) {
        const newOrder = new Order({
          userId: userid,
          items: items,
          totalAmount: totalamount,
          address: addressData.address[addressIndex],
          paymentMethod: paymentMethod,
          orderId: orderid,
          discount: discountAmount,
        });

        await newOrder.save();
        req.session.minprice = null;
        req.session.discount = null;
        req.session.coupenCode = null;

        wallet.balance -= totalamount;
        await wallet.save();

        res.status(200).json({ success: true });
      } else {
        res.json({ success: false, message: "Insufficient Balance" });
      }
    }
  } catch (error) {}
};

const checkCoupen = async (req, res) => {
  try {
    const coupencode = req.body.coupencode;
    const amount = req.body.totalAmount;

    const coupen = await Coupen.findOne({ coupenCode: coupencode });

    if (amount <= coupen.minPrice) {
      res.json({ success: false });
    } else {
      req.session.minprice = coupen.minPrice;
      req.session.discount = coupen.discount;
      req.session.coupenCode = coupen.coupenCode;

      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const removeCoupen = async (req, res) => {
  try {
    req.session.minprice = null;
    req.session.discount = null;
    req.session.coupenCode = null;

    res.json({ succes: true });
  } catch (error) {
    console.log(error.message);
  }
};

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
  loadOrder,
  razorpayment,
  checkCoupen,
  removeCoupen,
  WalletOrderPayment,
};
