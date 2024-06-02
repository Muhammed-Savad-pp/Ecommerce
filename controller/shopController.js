const category = require("../model/category_model");
const product = require("../model/product_model");
const CategoryOffer = require("../model/categoryOffer_model");
const ProdcutOffer = require('../model/productOffer_model')
const Cart = require('../model/cart_model')
const Wishilist = require('../model/wishilist_modal');
const { $options } = require("sift");

const loadShop = async (req, res) => {
  try {
    const search = req.query.input;
    const categoryid = req.query.category;
    const sortValue = req.query.sortvalue;
    const clearfilter = req.query.clearfilter;
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    let query = { is_delete: false };

    if (search) {
      query.$or = [{ pname: { $regex: search, $options: 'i' } }];
    } else if (categoryid) {
      query.category = categoryid;
    }

    let sortOptions = {};

    if (sortValue == 'HIGH - LOW') {
      sortOptions.price = -1;
    } else if (sortValue == 'LOW - HIGH') {
      sortOptions.price = 1;
    } else if (sortValue == 'A - Z') {
      sortOptions.pname = 1;
    } else if (sortValue == 'Z - A') {
      sortOptions.pname = -1;
    }

    const totalProducts = await product.countDocuments(query);
    let products = await product
      .find(query)
      .populate('category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const categorys = await category.find();
    const categoryOffers = await CategoryOffer.find({ activation: true });

    const userid = req.session.user_id;
    const Carts = await Cart.findOne({ userId: userid }).populate('product.productId');
    const cartsdata = Carts ? Carts.product : [];
    const wishilist = await Wishilist.findOne({ userId: userid }).populate('items.productId');
    const wishilistData = wishilist ? wishilist.items : [];

    for (let oneproduct of products) {
      const productId = oneproduct._id;
      let bestOfferPrice = oneproduct.price;

      const productOffer = await ProdcutOffer.findOne({ ProductId: productId });
      if (productOffer) {
        const offerPrice = oneproduct.price - (oneproduct.price * productOffer.offer / 100);
        bestOfferPrice = Math.min(bestOfferPrice, offerPrice);
      }

      const categoryid = oneproduct.category._id;
      const CatgegoryOffers = await CategoryOffer.findOne({ categoryId: categoryid });
      if (CatgegoryOffers) {
        const offerPrice = oneproduct.price - (oneproduct.price * CatgegoryOffers.offer / 100);
        bestOfferPrice = Math.min(bestOfferPrice, offerPrice);
      }

      await product.findByIdAndUpdate(productId, { offerprice: bestOfferPrice });
    }

    res.render("shop", {
      categoryData: categorys,
      productsData: products,
      cateoffers: categoryOffers,
      cartsdata: cartsdata,
      wishilistData: wishilistData,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      sortValue: sortValue,
      search: search,
      categoryid: categoryid
    });

    if (clearfilter) {
      res.redirect('/shop')
    }
  } catch (error) {
    console.log(error.message);
  }
};


const singleproduct = async (req, res) => {
  try {

    const userid = req.session.user_id
    const Carts = await  Cart.findOne({userId:userid}).populate('product.productId')

    const cartsdata = Carts ? Carts.product : [];

    
    const wishilist = await Wishilist.findOne({userId:userid}).populate('items.productId')
    const wishilistData = wishilist ? wishilist.items : [];

    const productid = req.query.id;
    const products = await product
      .findOne({ _id: productid })
      .populate("category");

    const categoryid = products.category;
    const relatedproducts = await product.find({ category: categoryid });

    res.render("singleproduct", {
      products: products,
      relatedproducts: relatedproducts,
      cartsdata:cartsdata,
      wishilistData:wishilistData
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadShop,
  singleproduct,
};
