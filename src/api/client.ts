import config from "../config.js";
import { Configuration, V2Api } from "stable-horde-api";

export default new V2Api(new Configuration(), config.horde.baseUrl);
