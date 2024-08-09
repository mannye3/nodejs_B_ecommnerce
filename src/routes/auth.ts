import  express , {NextFunction, Request, Response} from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../middlewares/error";

const router = express.Router();


//REGISTER
router.post("/register", async (req: Request, res :Response, next:NextFunction) => {
    try {
        const {name, email, password} = req.body;
         if (!name || !email || !password) {
        throw new CustomError(400, "All fields are required")
    }

        const existingUser = await User.findOne({ email: email})
        if(existingUser){
            throw new CustomError(400, "User already exists" )
        //  res.status(400).json({ message: 'User already exists'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({...req.body, password: hashedPassword})
        const savedUser = await newUser.save()

        res.status(201).json(savedUser)
    } catch (error) {
        next(error)
        
    }

})


//LOGIN

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const {email, password} = req.body;

         if (!email || !password) {
             throw new CustomError(400, "All fields are required")
       // return res.status(400).json({ error: 'All fields are required' });
    }

        const user = await User.findOne({email: email})
        if(!user){
            throw new CustomError(404, "User not found")
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            throw new CustomError(401, "Invalid credentials")
        }

        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET as string, {expiresIn: process.env.JWT_EXPIRATION as string})
        res.cookie("token", token).status(200).json("Logged in successfully")

    } catch (error) {
        next(error)
        
    }
})




// Fetch User

router.get("/fetch", async (req: Request, res: Response, next: NextFunction) => {

     const token = req.cookies.token
    try {
       
        if(!token){
            throw new CustomError(401, "Access denied. No token provided")
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        const id  = (decoded as JwtPayload)._id
        const user = await User.findById(id)
        //const user = await User.findById(decoded._id)

        if(!user){
            throw new CustomError(404, "User not found")
        }

        res.status(200).json(user)
    } catch (error) {
        next(error)
        
    }
})





//Logout 
router.get("/logout", async (req: Request, res: Response, next: NextFunction) => {
    try {

     res.clearCookie("token", {sameSite: "none", secure: true}).status(200).json("Logged out successfully")
    } catch (error) {
        
    }
})


export default router