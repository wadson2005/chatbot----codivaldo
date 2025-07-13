# Chatbot Multimodal com Gemini API e Persistência de Estado
## 1. Resumo do Projeto
Este projeto, desenvolvido para a disciplina de Inteligência Artificial, consiste na implementação de um chatbot full-stack, multimodal e com estado. A aplicação, denominada "Codivaldo", funciona como um assistente de programação que integra a API do Google Gemini para processar tanto entradas de texto quanto de imagem. O objetivo principal foi demonstrar a construção de uma aplicação de IA interativa, desde a configuração do backend e a comunicação via API REST até o desenvolvimento de um frontend acessível e com uma experiência de usuário rica.

## 2. Arquitetura da Solução
O sistema foi projetado sob uma arquitetura cliente-servidor desacoplada:

* Frontend (Cliente): Uma Single-Page Application (SPA) desenvolvida com Vanilla JavaScript, HTML5 e CSS3. É responsável por toda a renderização da interface, gerenciamento de estado do lado do cliente (localStorage) e pela comunicação com o backend. A aplicação é servida estaticamente por um servidor Python (http.server).

* Backend (Servidor): Uma API RESTful desenvolvida em Python com o micro-framework Flask. A API expõe um único endpoint principal (/chat) que lida com toda a lógica de negócio:

* * Recebe requisições POST contendo o prompt do usuário, a chave de API, o ID da sessão e, opcionalmente, um arquivo de imagem.

* * Processa a requisição, determinando se a tarefa é de conversação textual ou de análise visual.

* * Interage com a API do Google Gemini, enviando o prompt e o histórico (se aplicável).

* * Persiste a interação (pergunta e resposta) em um banco de dados SQLite.

* * Retorna a resposta do modelo para o cliente em formato JSON.

* Fluxo de Dados (Requisição com Imagem):

* * O cliente envia uma requisição POST para /chat com um corpo do tipo multipart/form-data.

* * O servidor Flask recebe os dados do formulário e o arquivo de imagem.

* * A imagem é processada pela biblioteca Pillow.

* * O backend instancia um modelo gemini-1.5-flash e envia o prompt textual junto com o objeto da imagem.

* * A resposta é recebida e salva no banco de dados.

* * A resposta é retornada ao cliente.

## 3. Funcionalidades Técnicas Implementadas

* Processamento Multimodal: A aplicação é capaz de processar requisições contendo apenas texto ou uma combinação de texto e imagem. O backend adapta a chamada à API Gemini com base no tipo de conteúdo recebido.

* Gerenciamento de Estado Persistente:

* * Lado do Cliente: O localStorage do navegador é utilizado para persistir a chave de API do usuário e o sessionId da conversa, garantindo a continuidade da sessão entre recargas de página.

* * Lado do Servidor: Um banco de dados SQLite armazena o histórico de todas as conversas, indexadas por sessionId. Para cada nova mensagem de texto, o histórico relevante é recuperado e enviado à API Gemini para manter o contexto conversacional.

* Renderização Dinâmica de Conteúdo: O frontend utiliza a biblioteca marked.js para converter as respostas do modelo (que podem conter sintaxe Markdown) em HTML. Blocos de código são identificados e processados pela highlight.js para aplicar o destaque de sintaxe, e um botão "Copiar" é injetado dinamicamente.

* Engenharia de Prompt: Uma SYSTEM_INSTRUCTION detalhada é utilizada para definir a persona, o escopo de conhecimento e as regras de comportamento do modelo de IA para interações textuais, garantindo consistência nas respostas.

* Foco em Acessibilidade (a11y): A estrutura do HTML foi construída com semântica apropriada (ex: <article> para mensagens, <h3> para remetentes) para otimizar a navegação e a compreensão por leitores de tela.

## 4. Stack de Tecnologias
* Frontend: HTML5, CSS3, Vanilla JavaScript

* Backend: Python 3, Flask, Flask-Cors

* IA: Google Gemini API (gemini-1.5-flash)

* Banco de Dados: SQLite

* Bibliotecas Python: google-generativeai, Pillow

* Bibliotecas JavaScript: marked.js, highlight.js

## 5. Instruções de Execução
Pré-requisitos:

* Python 3.x

* Chave de API do Google AI Studio

### Passos:

* Clone o repositório: git clone https://github.com/wadson2005/chatbot----codivaldo.git && cd chatbot----codivaldo

* Crie e ative o ambiente virtual:

* * Windows: python -m venv venv && venv\Scripts\activate

* * macOS/Linux: python3 -m venv venv && source venv/bin/activate

* Instale as dependências: pip install Flask Flask-Cors google-generativeai Pillow

* Inicie o Backend: Em um terminal, execute flask run.

* Inicie o Frontend: Em um segundo terminal, execute python -m http.server.

* Acesse a aplicação: Abra o navegador em http://localhost:8000.

## Informações do Projeto
* Autor: Wadson Tardelle Dias de Lima

* Disciplina: Inteligência Artificial