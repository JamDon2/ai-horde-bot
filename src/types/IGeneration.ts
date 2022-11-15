import { Document } from "mongoose";

interface IGeneration extends Document {
    _id: string;
    author: string;
    prompt: string;
    style: string;
}

export default IGeneration;
