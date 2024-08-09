import mongoose from 'mongoose';



const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING)
    // const connect = await mongoose.connect("mongodb+srv://manny_e3:goodboy4u.com@cluster0.ik9ayjs.mongodb.net/ecommerce?retryWrites=true&w=majority")

        console.log("Database connected: ", connect.connection.host,connect.connection.name)
    } catch (err) {
        console.log(err)
        process.exit(1);
        
    }
}


export default connectDb;