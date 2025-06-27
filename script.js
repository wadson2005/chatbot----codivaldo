import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const apiKeySection = document.getElementById('api-key-section');
const chatSection = document.getElementById('chat-section');
const apiKeyInput = document.getElementById('api-key-input');
const startButton = document.getElementById('start-button');
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatWindow = document.getElementById('chat-window');

let userApiKey = '';
const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

startButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Por favor, insira uma chave de API válida.');
        return;
    }
    userApiKey = apiKey;
    apiKeySection.style.display = 'none';
    chatSection.style.display = 'flex';
    promptInput.focus();
});

chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    addMessage(prompt, 'user');
    promptInput.value = '';
    
    const loadingIndicator = addMessage('Pensando...', 'bot');
    loadingIndicator.classList.add('loading');
    
    try {
        const backendUrl = 'http://127.0.0.1:5000/chat';

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                apiKey: userApiKey,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        
        const messageContentElement = loadingIndicator.querySelector('.message-content');
        if(messageContentElement) {
            messageContentElement.textContent = data.response;
        } else {
            loadingIndicator.textContent = data.response;
        }
        loadingIndicator.classList.remove('loading');

    } catch (error) {
        const messageContentElement = loadingIndicator.querySelector('.message-content');
        if(messageContentElement) {
            messageContentElement.textContent = `Erro: ${error.message}`;
        }
        console.error(error);
    }
});

function addMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${type}-message`);
    
    const senderNameElement = document.createElement('strong');
    senderNameElement.classList.add('sender-name');
    senderNameElement.textContent = (type === 'user') ? 'Você' : 'Codivaldo';

    const messageContentElement = document.createElement('span');
    messageContentElement.classList.add('message-content');
    messageContentElement.textContent = text;
    
    messageElement.appendChild(senderNameElement);
    messageElement.appendChild(messageContentElement);
    
    chatWindow.appendChild(messageElement);
    
    chatWindow.scrollTop = chatWindow.scrollHeight; 
    
    return messageElement;
}
