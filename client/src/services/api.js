import axios from "axios";

const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout:15000,
    headers:{
        "Content-Type":"application/json"
    }
})

export async function sendMessage(message) {
    const response = await api.post('/api/chat', { message })
    return response.data
}

export async function submitFeedback(messageId, feedback) {
    const response = await api.post('/api/feedback', { messageId, feedback })
    return response.data
}

export default api;