import { Document } from "mongoose";

interface IUser extends Document {
    _id: string;
    apiKey: string;
    username: string;
    notifications: {
        send: number;
        receive: number;
    };
    public: boolean;
    totalDonated: number;
}

export default IUser;
