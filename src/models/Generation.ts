import mongoose from "../db/client.js";
import IGeneration from "../types/IGeneration.js";

const GenerationSchema = new mongoose.Schema<IGeneration>({
    _id: { type: String, required: true },
    prompt: { type: String, required: true, index: true },
    style: { type: String, required: true },
});

export default mongoose.model<IGeneration>("Generation", GenerationSchema);
