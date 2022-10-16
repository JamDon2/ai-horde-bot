interface IUserDocument {
    _id: string;
    apiKey: string;
    username: string;
    notifications: {
        send: number;
        receive: number;
    };
    public: boolean;
}

export default IUserDocument;
