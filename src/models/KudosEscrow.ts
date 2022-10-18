import config from "../config.js";
import mongoose from "../db/client.js";
import IKudosEscrow from "../types/IKudosEscrow.js";

const KudosEscrowSchema = new mongoose.Schema<IKudosEscrow>({
    from: { type: String, required: true },
    to: { type: String, required: true, index: true },
    emoji: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: config.escrowtime,
        required: true,
    },
    messageURL: { type: String, required: true },
});

export default mongoose.model<IKudosEscrow>("KudosEscrow", KudosEscrowSchema);
