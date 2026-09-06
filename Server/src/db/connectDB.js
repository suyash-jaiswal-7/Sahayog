import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}${DB_NAME}`);
        console.log(`MongoDb Connected!! DB HOST: ${connectionInstance.connection.host}${DB_NAME}`);
    } catch (error) {
        console.log("MongoDB Connection Error: ", error);
        process.exit(1);
    }
}

export default connectDB;