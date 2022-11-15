import { Model } from "mongoose";

import IGeneration from "./IGeneration.js";
import IKudosEscrow from "./IKudosEscrow.js";
import IUser from "./IUser.js";

type Models = {
    User: Model<IUser>;
    Generation: Model<IGeneration>;
    KudosEscrow: Model<IKudosEscrow>;
};

export default Models;
