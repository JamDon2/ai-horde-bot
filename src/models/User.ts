import mongoose from "../db/client.js";
import IUserDocument from "../types/IUserDocument.js";

const UserSchema = new mongoose.Schema<IUserDocument>({
    _id: { type: String, required: true },
    apiKey: { type: String, required: true },
    username: { type: String, required: true },
    notifications: {
        send: { type: Number, default: 0 },
        receive: { type: Number, default: 0 },
    },
    public: { type: Boolean, default: false },
});

export default mongoose.model<IUserDocument>("User", UserSchema);
