import mongoose from "../db/client.js";
import IUser from "../types/IUser.js";

const UserSchema = new mongoose.Schema<IUser>({
    _id: { type: String, required: true },
    apiKey: { type: String, required: true },
    username: { type: String, required: true },
    notifications: {
        send: { type: Number, default: 0 },
        receive: { type: Number, default: 0 },
    },
    public: { type: Boolean, default: false },
    totalDonated: { type: Number, default: 0 },
});

export default mongoose.model<IUser>("User", UserSchema);
