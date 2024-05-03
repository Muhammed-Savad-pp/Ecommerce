const category = require('../model/category_model')
const product = require('../model/product_model')



const loadShop = async(req,res)=>{

    try {
        
        const categorys = await category.find();
        const products = await product.find();
        res.render('shop',{categoryData:categorys,productsData:products})

    } catch (error) {
        console.log(error.message);
    }


}

const singleproduct = async(req,res)=>{

    try {
        
        const productid = req.query.id;
        const products = await product.findOne({_id:productid}).populate('category');

        const categoryid = products.category;
        const relatedproducts = await product.find({category:categoryid})
        
        res.render('singleproduct',{products:products,relatedproducts:relatedproducts})

    } catch (error) {
        console.log(error.message);
    }

}

module.exports ={
    loadShop,
    singleproduct
}