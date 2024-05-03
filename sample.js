const confirmOrder = async (req, res) => {

    try {

        const userId = req.session._id;
        const paymentMethod = req.body.paymentMethod;
        const addressIndex = req.session.addressIndex;
        const addressData = await Address.findOne({ user_id: userId });
        const orderId = generateOrderID();
        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');

        let outOfStockProducts = [];
        let maxStockExceed = [];
        if (cartData) {
            for (const item of cartData.items) {
                console.log(item.quantity)
                const product = item.products;

                if (product.quantity <= 0) {
                    outOfStockProducts.push(product.name);

                } else if (product.quantity < item.quantity) {
                    maxStockExceed.push(product.name);
                }
            }
        }

        if (outOfStockProducts.length > 0) {
            res.status(400).json({ message: 'Few items are unavailable for checkout.Please remove them before continue.' });
        } else if (maxStockExceed.length > 0) {
            res.status(400).json({ message: 'Few items are exceed maximum quantity.Please reduce the quantity before continue.' });
        } else {

            let totalAmount = 0;
            const items = [];

            for (const item of cartData.items) {
                const product = await Product.findById(item.products);

                const itemDetails = {
                    product_id: item.products,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    gender: product.gender,
                    brand: product.brand,
                    imageUrl: product.images[0],
                    quantity: item.quantity,
                };
                
                items.push(itemDetails);
                totalAmount += product.price * item.quantity;
                product.quantity -= item.quantity;
                await product.save();
            }

            await Cart.findOneAndUpdate({ user_id: userId }, { items: [] });

            const newOrder = new Order({
                user: userId,
                orderId: orderId,
                totalAmount: totalAmount,
                items: items,
                address: addressData.address[addressIndex], // Assuming cartData has address information
                payment_method: paymentMethod,
            });
            await newOrder.save();

            res.status(200).json({ success: true });
        }

        console.log(paymentMethod);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}