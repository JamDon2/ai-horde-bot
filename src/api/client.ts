import axios from "axios";

export default axios.create({
    baseURL: "https://stablehorde.net/api/v2",
});
