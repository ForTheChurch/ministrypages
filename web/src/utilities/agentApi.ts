import axios from 'axios'

const agentApi = axios.create({
  baseURL: `${process.env.AGENT_URL || 'http://localhost:3005'}/api`,
  headers: {
    'X-Agent-API-Key': process.env.AGENT_API_KEY || '',
  },
})

export default agentApi
