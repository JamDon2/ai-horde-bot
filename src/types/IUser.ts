interface IUser {
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
