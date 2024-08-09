import express, {Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { CustomError } from '../middlewares/error';

const router = express.Router();



// Create product (only for admin users)

router.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, price, description, images, category } = req.body;

        // Basic validation
        if (!name || !price || !description || !images || !category) {
            throw new CustomError(400, "Missing required fields: name, price, description, images, category");
        }

        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        
        next(error);
    }
});





// Edit Product

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, price, description, images, category } = req.body;

        // Basic validation
        if (!name ||!price ||!description ||!images ||!category) {
            throw new CustomError(400, "Missing required fields: name, price, description, images, category");
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedProduct) {
            throw new CustomError(404, "Product not found");
        }

        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
});






// Get all products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
       // res.status(500).json({ message: error.message });
    }
});



// get single product

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new CustomError(404, "Product not found");
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
});





// Get product based on category

router.get('/:category', async (req: Request, res: Response, next: NextFunction) => {
        const category = req.params.category;

    try {
        const products = await Product.find({ category });
        res.json(products);
    } catch (error) {
        // res.status(500).json({ message: error.message });
    }
});



// Search products

router.get("/search/:query", async (req: Request, res: Response, next: NextFunction) => {
    const query = req.params.query
    try {

        const products = await Product.find({
            $or: [
                { name: { $regex: new RegExp(query, 'i') } },
                { category: { $regex: new RegExp(query, 'i') } }
            ]
        })
        res.status(200).json(products)

    }
    catch (error) {
        next(error)
    }
})

export default router;