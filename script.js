import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const apiKeySection = document.getElementById('api-key-section');
const chatSection = document.getElementById('chat-section');
const apiKeyInput = document.getElementById('api-key-input');
const startButton = document.getElementById('start-button');
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatWindow = document.getElementById('chat-window');
const forgetApiKeyBtn = document.getElementById('forget-api-key-btn');
const attachImageBtn = document.getElementById('attach-image-btn');
const imageInput = document.getElementById('image-input');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');

let userApiKey = localStorage.getItem('userApiKey') || '';
let sessionId = localStorage.getItem('chatSessionId');
let attachedImageFile = null;

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

function resetImageAttachment() {
    attachedImageFile = null;
    imageInput.value = '';
    imagePreviewContainer.style.display = 'none';
}

startButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Por favor, insira uma chave de API válida.');
        return;
    }
    userApiKey = apiKey;
    localStorage.setItem('userApiKey', userApiKey);
    initializeApp();
});

forgetApiKeyBtn.addEventListener('click', () => {
    localStorage.removeItem('userApiKey');
    localStorage.removeItem('chatSessionId');
    location.reload();
});

attachImageBtn.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        attachedImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

removeImageBtn.addEventListener('click', resetImageAttachment);

chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = promptInput.value.trim();
    if (!prompt && !attachedImageFile) return;

    
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('apiKey', userApiKey);
    formData.append('sessionId', sessionId);
    if (attachedImageFile) {
        formData.append('image', attachedImageFile);
    }

    // 2. Adiciona a mensagem à tela.
    addMessage(prompt, 'user', attachedImageFile);
    

    promptInput.value = '';
    resetImageAttachment();

    const loadingIndicator = addMessage('Pensando...', 'bot');
    loadingIndicator.classList.add('loading');
    
    try {
        const backendUrl = 'http://127.0.0.1:5000/chat';

        const response = await fetch(backendUrl, {
            method: 'POST',
            body: formData 
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

function addMessage(text, type, imageFile = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${type}-message`);
    
    const senderNameElement = document.createElement('h3');
    senderNameElement.classList.add('sender-name');
    senderNameElement.textContent = (type === 'user') ? 'Você' : 'Codivaldo';
    messageElement.appendChild(senderNameElement);

    if (imageFile && type === 'user') {
        const imageElement = document.createElement('img');
        imageElement.src = URL.createObjectURL(imageFile);
        imageElement.className = 'message-image-preview';
        messageElement.appendChild(imageElement);
    }
    
    if (text) {
        const messageContentElement = document.createElement('span');
        messageContentElement.classList.add('message-content');
        messageContentElement.textContent = text;
        messageElement.appendChild(messageContentElement);
    }
    
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; 
    
    return messageElement;
}

initializeApp();
