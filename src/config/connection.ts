import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URL = process.env.MONGO_URI || "";


const connectionDB = async() => {
    try {
        await mongoose.connect(MONGO_URL);
    } catch (error) {
        throw Error('check the connection');
    }
}
export default connectionDB; 