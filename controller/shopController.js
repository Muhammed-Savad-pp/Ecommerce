const category = require("../model/category_model");
const product = require("../model/product_model");
const CategoryOffer = require("../model/categoryOffer_model");
const ProdcutOffer = require("../model/productOffer_model");
const Cart = require("../model/cart_model");
const Wishilist = require("../model/wishilist_modal");
const { $options } = require("sift");

const loadShop = async (req, res) => {
  try {
    const searchQuery = req.query.search ;
    const categoryFilter = req.query.category ? req.query.category.split(","): [];
    const sortBy = req.query.sortBy ;

    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const filter = {
      is_delete: 0,
      pname: { $regex: new RegExp(searchQuery, "i") }
    };

    if (categoryFilter.length > 0) {
      filter.category = { $in: categoryFilter };
    }
   

    
        let sortOption = {};
        if (sortBy === 'HIGH - LOW') {

            sortOption = { offerprice: -1 };

        } else if (sortBy === 'LOW - HIGH') {

            sortOption = { offerprice: 1 };

        } else if (sortBy === 'A - Z') {

            sortOption = { pname: 1 };

        } else {

            sortOption = { pname: -1 }; 

        }

         let productsData = await product.find(filter).populate('category').sort(sortOption).skip(skip).limit(limit);
         const totalProducts = await product.countDocuments(filter);
         const totalPages = Math.ceil(totalProducts / limit);
     
    const categorys = await category.find();
    const categoryOffers = await CategoryOffer.find({ activation: true });

    const userid = req.session.user_id;
    const Carts = await Cart.findOne({ userId: userid }).populate('product.productId');
    const cartsdata = Carts ? Carts.product : [];
    const wishilist = await Wishilist.findOne({ userId: userid }).populate('items.productId');
    const wishilistData = wishilist ? wishilist.items : [];

    for (let oneproduct of productsData) {
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
      productsData: productsData,
      cateoffers: categoryOffers,
      cartsdata: cartsdata,
      wishilistData: wishilistData,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      req: req,
      selectedCategories: categoryFilter,
      sortBy,
      search: searchQuery
    });

    
   

  } catch (error) {
    console.log(error.message);
  }
};

const singleproduct = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const Carts = await Cart.findOne({ userId: userid }).populate(
      "product.productId"
    );

    const cartsdata = Carts ? Carts.product : [];

    const wishilist = await Wishilist.findOne({ userId: userid }).populate(
      "items.productId"
    );
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
      cartsdata: cartsdata,
      wishilistData: wishilistData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadShop,
  singleproduct,
};
