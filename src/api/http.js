import axios from "axios";

const http = axios.create({
    baseURL: "http://localhost:8080/SIMS_Backend/api",
    headers: {
        "Content-Type": "application/json"
    }
});

export default http;