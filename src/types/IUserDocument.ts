interface IUserDocument {
    id: string;
    apiKey: string;
    username: string;
    notifications?: {
        send: number;
        receive: number;
    };
}

export default IUserDocument;