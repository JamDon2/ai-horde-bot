import mongoose from "mongoose";
import "dotenv/config";

const client = await mongoose.connect(process.env.MONGODB_URI as string, {
    dbName: process.env.MONGODB_DATABASE,
});

export default client;
