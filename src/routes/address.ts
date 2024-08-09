import express, { NextFunction, Request, Response } from 'express'
import Address from '../models/Address'
import { CustomError } from '../middlewares/error';
import User from '../models/User';
import mongoose from 'mongoose';
const router = express.Router()

//CREATE
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user, addressLine1, addressLine2, city, state, country, postalCode } = req.body;

        // Basic validation
        if (!user || !addressLine1 || !city || !state || !country || !postalCode) {
            throw new CustomError(400, "Missing required fields");
        }

        // Check if user exists
        const userExists = await User.findById(user);
        if (!userExists) {
            throw new CustomError(404, "User not found");
        }

        const newAddress = new Address({
            user,
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            postalCode
        });

        const savedAddress = await newAddress.save();
        res.status(201).json(savedAddress);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

//UPDATE
router.put('/update/:id', async (req: Request, res: Response, next: NextFunction) => {
    const addressId = req.params.id;
    const { user, addressLine1, addressLine2, city, state, country, postalCode } = req.body;

    try {
        // Basic validation
        if (!addressId || !user || !addressLine1 || !city || !state || !country || !postalCode) {
            throw new CustomError(400, "Missing required fields");
        }

        // Check if the user exists
        const userExists = await User.findById(user);
        if (!userExists) {
            throw new CustomError(404, "User not found");
        }

        // Find and update the address
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            { user, addressLine1, addressLine2, city, state, country, postalCode },
            { new: true, runValidators: true } // Ensure it returns the updated document and runs validators
        );

        if (!updatedAddress) {
            throw new CustomError(404, "Address not found");
        }

        res.status(200).json(updatedAddress);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

//DELETE
router.delete("/delete/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Address.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "Address has been deleted!" })
    }
    catch (error) {
        next(error)
    }
})

//GET USER ADDRESSES
router.get("/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const addresses = await Address.find({ user: req.params.userId })
        res.status(200).json(addresses)
    }
    catch (error) {
        next(error)
    }
})


export default router