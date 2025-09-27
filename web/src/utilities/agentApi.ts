import axios from "axios";

const agentApi = axios.create({
    baseURL: `${process.env.AGENT_URL || 'http://localhost:3005'}/api`,
});

export default agentApi;
