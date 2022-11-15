import { Document } from "mongoose";

interface IKudosEscrow extends Document {
    from: string;
    to: string;
    emoji: string;
    createdAt: Date;
    messageURL: string;
}

export default IKudosEscrow;
