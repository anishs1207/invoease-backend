import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import Cookies from "js-cookie";

const connectionDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected : DB-Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Error : Error", error);
        process.exit(1);
    }
}


export default connectionDB;
