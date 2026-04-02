# Codivaldo Chatbot

Chatbot multimodal para programação, com suporte a texto e imagem usando Google Gemini.

## Objetivo

Oferecer uma interface web simples para conversar com IA, manter contexto da sessão e permitir análise de imagens.

## Funcionalidades

- Chat com IA para dúvidas de tecnologia.
- Envio de imagem junto com prompt.
- Histórico por sessão salvo em SQLite.
- API key e sessão persistidas no navegador.
- Renderização de respostas em Markdown com destaque de código.

## Tecnologias

- Backend: Python, Flask, Flask-CORS, SQLite, Pillow, google-generativeai.
- Frontend: HTML, CSS, JavaScript, marked.js, highlight.js.

## Pré-requisitos

- Python 3.10+.
- Chave de API do Google AI Studio.

## Como executar

1. Clone o repositório e entre na pasta do projeto.
2. Crie e ative um ambiente virtual.

```bash
# Windows
python -m venv venv
venv\Scripts\activate
```

```bash
# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

3. Instale as dependências:

```bash
pip install Flask Flask-Cors google-generativeai Pillow
```

4. Inicie o backend:

```bash
flask run
```

5. Em outro terminal, inicie o frontend estático:

```bash
python -m http.server
```

6. Abra no navegador:

- Frontend: http://localhost:8000
- Backend: http://127.0.0.1:5000

## Como usar

1. Abra a aplicação.
2. Informe sua API key.
3. Digite uma pergunta e envie.
4. Opcional: anexe uma imagem antes de enviar.

## Estrutura do projeto

- app.py: API Flask e integração com Gemini.
- index.html: estrutura da interface.
- script.js: lógica do chat no cliente.
- styles.css: estilos da aplicação.

## Observações

- O histórico de conversa é salvo no arquivo local de banco SQLite.
- A API key fica armazenada no navegador até você clicar em "Esquecer Chave".