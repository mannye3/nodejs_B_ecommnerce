import express from 'express';
import dotenv from 'dotenv'
import connectDb from './database/connectDB';
import authRoute from './routes/auth';
import userRoute from './routes/users';
import addressRoute from './routes/address';
import productRoute from './routes/products';
import orderRouter from './routes/orders'
import cartRouter from './routes/carts'
import wishListRouter from './routes/wishlists'
import cookieParser from 'cookie-parser';
import {errorHandler} from './middlewares/error'
import verifyToken from './middlewares/verifyToken';

const app = express();

dotenv.config();


// Bodyparser middleware
app.use(express.json());
app.use(cookieParser())


// Routes middleware
app.use("/api/auth", authRoute)
app.use("/api/user",  verifyToken, userRoute)
app.use("/api/address",  verifyToken, addressRoute)
app.use("/api/orders",  verifyToken, orderRouter)
app.use("/api/carts",  verifyToken, cartRouter)
app.use("/api/wishlists",  verifyToken, wishListRouter)




app.use("/api/product", productRoute)

app.use(errorHandler)

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
   connectDb()
      console.log(`Server is running at PORT ${PORT}`);
});