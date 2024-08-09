import express, { NextFunction, Request, Response } from 'express'
import Order from '../models/Order'
import { CustomError } from '../middlewares/error';
import Address from '../models/Address';
import User from '../models/User';
import Product from '../models/Product';
const router = express.Router()


//CREATE 

   router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, products, addressId } = req.body;

        console.log(req.body);
        // Basic validation
        if (!userId || !products || !addressId) {
            throw new CustomError(400, "Missing required fields");
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError(404, "User not found");
        }

        // Check if address exists
        const address = await Address.findById(addressId);
        if (!address) {
            throw new CustomError(404, "Address not found");
        }

        // Validate products and calculate total price
        let totalPrice = 0;
        const validatedProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new CustomError(404, `Product with ID ${item.productId} not found`);
            }
            if (item.quantity <= 0) {
                throw new CustomError(400, "Quantity must be greater than zero");
            }

            validatedProducts.push({
                product: product._id,
                quantity: item.quantity
            });

            totalPrice += product.price * item.quantity;
        }

        // Create new order
        const newOrder = new Order({
            user: user._id,
            products: validatedProducts,
            total_price: totalPrice,
            address: address._id,
            status: "pending" // Default status
        });

        await newOrder.save();

        res.status(201).json(newOrder);
    } catch (error) {
        next(error);
    }
});



// Delete 
router.delete("/cancel/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;

        // Check if the order exists
        const order = await Order.findById(orderId);
        if (!order) {
            throw new CustomError(404, "Order not found");
        }

        // Delete the order
        await order.deleteOne();

        res.status(200).json({ message: "Order cancelled successfully!" });
    } catch (error) {
        next(error);
    }
});




//Get user orders

router.get("/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError(404, "User not found");
        }

        // Get all orders made by the user
        const orders = await Order.find({ user: userId });

        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
});


    export default router 