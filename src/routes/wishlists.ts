import express, { NextFunction, Request, Response } from 'express'
import WishList from '../models/WishList'
import { CustomError } from '../middlewares/error';
 import User from '../models/User';
 import Product from '../models/Product';

const router = express.Router()


//ADD TO WISHLIST

router.post("/add", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId } = req.body;

        // Validate inputs
        if (!userId || !productId) {
            throw new CustomError(400, "Missing required fields: userId or productId");
        }


         const product = await Product.findById(productId);
        if (!product) {
            throw new CustomError(404, "Product not found");
        }



        let wishlist = await WishList.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await WishList.create({ user: userId, products: [] });
        }

        if (wishlist.products.some(item => item.product.toString() === productId)) {
            throw new CustomError(400, "Product already exists in the wishlist!");
        }

        wishlist.products.push({ product: productId });
        await wishlist.save();

        res.status(200).json({ message: "Product added to wishlist successfully!" });
    } catch (error) {
        next(error);
    }
});

//REMOVE
router.post("/remove", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId } = req.body;

        // Validate inputs
        if (!userId || !productId) {
            throw new CustomError(400, "Missing required fields: userId or productId");
        }

        let wishlist = await WishList.findOne({ user: userId });
        if (!wishlist) {
            throw new CustomError(404, "Wishlist not found!");
        }

         await WishList.findByIdAndDelete(wishlist.id)
        res.status(200).json({ message: "Product removed from wishlist!" })

        
    } catch (error) {
        next(error);
    }
});


//GET USER WISHLIST
router.get("/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wishlist = await WishList.findOne({ user: req.params.userId }).populate("products.product");

        if (!wishlist) {
            throw new CustomError(404, "Wishlist not found!");
        }

        res.status(200).json(wishlist);
    } catch (error) {
        next(error);
    }
});





export default router