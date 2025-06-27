import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const apiKeySection = document.getElementById('api-key-section');
const chatSection = document.getElementById('chat-section');
const apiKeyInput = document.getElementById('api-key-input');
const startButton = document.getElementById('start-button');
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatWindow = document.getElementById('chat-window');

// ---VARIÁVEIS DE ESTADO ---
let userApiKey = '';

//  EVENT LISTENERS
startButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    // Validação simples: se a chave estiver vazia, avisa o usuário.
    if (!apiKey) {
        alert('Por favor, insira uma chave de API válida.');
        return;
    }

    userApiKey = apiKey;
    
    // Esconde a seção de boas-vindas e mostra a seção do chat.
    apiKeySection.style.display = 'none';
    chatSection.style.display = 'flex';
    promptInput.focus();
});

// Ação para quando o formulário de chat é enviado
chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = promptInput.value.trim();
    
    if (!prompt) return; 

    addMessage(prompt, 'user');
    promptInput.value = '';

    // Adiciona uma mensagem de "loading" para o usuário saber que o bot está "pensando".
    const loadingIndicator = addMessage('Pensando...', 'bot');
    loadingIndicator.classList.add('loading');
    
    try {
        // Endereço do servidor Flask que está rodando localmente.
        const backendUrl = 'http://127.0.0.1:5000/chat'; 

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Conteúdo da requisição
            body: JSON.stringify({
                prompt: prompt,
                apiKey: userApiKey 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        loadingIndicator.textContent = data.response; 
        loadingIndicator.classList.remove('loading');
    } catch (error) {
        loadingIndicator.textContent = `Erro: ${error.message}`;
        console.error(error);
    }
});



function addMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${type}-message`);
    messageElement.textContent = text;
    chatWindow.appendChild(messageElement);
    
    chatWindow.scrollTop = chatWindow.scrollHeight; 
    
    return messageElement;
}