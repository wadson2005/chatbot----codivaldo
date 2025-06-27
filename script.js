import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const apiKeySection = document.getElementById('api-key-section');
const chatSection = document.getElementById('chat-section');
const apiKeyInput = document.getElementById('api-key-input');
const startButton = document.getElementById('start-button');
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatWindow = document.getElementById('chat-window');
const forgetApiKeyBtn = document.getElementById('forget-api-key-btn');

let userApiKey = localStorage.getItem('userApiKey') || '';
let sessionId = localStorage.getItem('chatSessionId');

if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatSessionId', sessionId);
}

function initializeApp() {
    if (userApiKey) {
        apiKeySection.style.display = 'none';
        chatSection.style.display = 'flex';
        promptInput.focus();
    } else {
        apiKeySection.style.display = 'flex';
        chatSection.style.display = 'none';
    }
}

startButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Por favor, insira uma chave de API válida.');
        return;
    }
    userApiKey = apiKey;
    localStorage.setItem('userApiKey', userApiKey);
    
    apiKeySection.style.display = 'none';
    chatSection.style.display = 'flex';
    promptInput.focus();
});

forgetApiKeyBtn.addEventListener('click', () => {
    localStorage.removeItem('userApiKey');
    localStorage.removeItem('chatSessionId');
    location.reload();
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
        
        if (messageContentElement) {
            messageContentElement.innerHTML = marked.parse(data.response);
            addCopyButtonsAndHighlight(messageContentElement);
        }
        
        loadingIndicator.classList.remove('loading');

    } catch (error) {
        const messageContentElement = loadingIndicator.querySelector('.message-content');
        if (messageContentElement) {
            messageContentElement.textContent = `Erro: ${error.message}`;
        }
        console.error(error);
    }
});

function addCopyButtonsAndHighlight(container) {
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach((codeBlock) => {
        hljs.highlightElement(codeBlock);

        const preElement = codeBlock.parentElement;
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar';
        copyButton.className = 'copy-btn';
        
        copyButton.addEventListener('click', () => {
            const codeToCopy = codeBlock.textContent;
            const textArea = document.createElement('textarea');
            textArea.value = codeToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                copyButton.textContent = 'Copiado!';
            } catch (err) {
                console.error('Falha ao copiar texto: ', err);
                copyButton.textContent = 'Erro!';
            }
            document.body.removeChild(textArea);

            setTimeout(() => {
                copyButton.textContent = 'Copiar';
            }, 2000);
        });

        preElement.appendChild(copyButton);
    });
}

function addMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${type}-message`);
    
    const senderNameElement = document.createElement('h3');
    senderNameElement.classList.add('sender-name');
    senderNameElement.textContent = (type === 'user') ? 'Você' : 'Codivaldo';

    const messageContentElement = document.createElement('span');
    messageContentElement.classList.add('message-content');
    
    if (type === 'user') {
        messageContentElement.textContent = text;
    } else {
        messageContentElement.textContent = text;
    }
    
    messageElement.appendChild(senderNameElement);
    messageElement.appendChild(messageContentElement);
    
    chatWindow.appendChild(messageElement);
    
    chatWindow.scrollTop = chatWindow.scrollHeight; 
    
    return messageElement;
}

initializeApp();
