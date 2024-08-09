import  express , {NextFunction, Request, Response} from "express";
import bcrypt from "bcrypt";
import User from '../models/User';
import { CustomError } from '../middlewares/error';

const router = express.Router();



//UPDATE
router.put("/update/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashedPassword;
        }
        
        const user = await User.findById(req.params.userId);
        if (!user) {
            throw new CustomError(404, "User not found");
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.userId, {
            $set: req.body
        }, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});




//Get User information

router.get("/:userId", async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new CustomError(404, "User not found");
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});




//Delete User

router.delete("/:userId", async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new CustomError(404, "User not found");
        }

        res.status(204).json("Account deleted");
    } catch (error) {
        next(error);
    }
});




export default router 