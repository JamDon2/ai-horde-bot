import { MongoClient } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_URI as string);

await client.connect();

export default client.db(process.env.MONGODB_DATABASE);
