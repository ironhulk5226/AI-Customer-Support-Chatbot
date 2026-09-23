import axios from "axios";

const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout:15000,
    headers:{
        "Content-Type":"application/json"
    }
})

export async function sendMessage(message, language = 'en') {
    const response = await api.post('/api/chat', { message, language })
    return response.data
}

export async function translateTexts(texts, target = 'en') {
    const translations = []
    for (let index = 0; index < texts.length; index += 100) {
        const response = await api.post('/api/translate', { texts: texts.slice(index, index + 100), target })
        translations.push(...(response.data.translations || []))
    }
    return translations
}

export async function submitFeedback(messageId, feedback) {
    const response = await api.post('/api/feedback', { messageId, feedback })
    return response.data
}

export async function getConversations() {
    const response = await api.get('/api/conversations')
    return response.data.conversations || response.data || []
}

export async function getConversation(id) {
    const response = await api.get(`/api/conversations/${id}`)
    return response.data.conversation || response.data || null
}

export async function saveConversation(payload) {
    const response = await api.post('/api/conversations', payload)
    return response.data
}

export default api;