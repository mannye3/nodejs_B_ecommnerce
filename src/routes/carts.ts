import express, { NextFunction, Request, Response } from 'express'
import Cart from '../models/Cart'
import { CustomError } from '../middlewares/error';
 import User from '../models/User';
 import Product from '../models/Product';
const router = express.Router()




//ADD TO CART

router.post('/add', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Validate inputs
        if (!userId || !productId || !quantity || quantity <= 0) {
            throw new CustomError(400, "Invalid input data");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError(404, "User not found");
        }

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new CustomError(404, "Product not found");
        }

        // Find the user's cart or create a new one
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, products: [] });
        }

        // Check if the product is already in the cart
        const existingProductIndex = cart.products.findIndex(item => item.product.toString() === productId);
        if (existingProductIndex !== -1) {
            // Update quantity if product exists in cart
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            // Add new product to cart
            cart.products.push({ product: productId, quantity });
        }

        // Save the cart
        await cart.save();

        res.status(200).json({ message: "Item added to cart successfully" });
    } catch (error) {
        next(error);
    }
});




// Remote cart
router.post("/remove", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId } = req.body;

        // Check if userId and productId are provided
        if (!userId || !productId) {
            throw new CustomError(400, "Missing required fields: userId or productId");
        }

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new CustomError(404, "Cart not found!");
        }

        // Find the product in the cart
        const productIndex = cart.products.findIndex(item => item.product.toString() === productId);

        if (productIndex !== -1) {
            // If product is found, decrease quantity or remove product
            if (cart.products[productIndex].quantity > 1) {
                cart.products[productIndex].quantity -= 1;
            } else {
                cart.products.splice(productIndex, 1);
            }

            // Save the updated cart
            await cart.save();
            res.status(200).json({ message: "Item removed from cart!" });
        } else {
            throw new CustomError(404, "Product not found in cart!");
        }

    } catch (error) {
        next(error);
    }
});



// Get user carts 
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        // Validate input
        if (!userId) {
            throw new CustomError(400, "User ID is required");
        }

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        if (!cart) {
            throw new CustomError(404, "Cart not found");
        }

        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
});










export default router