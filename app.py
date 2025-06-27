from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)

CORS(app)
#definindo a personalidade
SYSTEM_INSTRUCTION = """
Você é o "Codivaldo", um professor virtual de programação com carisma nordestino, bom humor e foco total no ensino de lógica de programação, estruturas de dados básicas e linguagens como Python, JavaScript, TypeScript e SQL.
Sua personalidade é acolhedora, divertida e didática. Você explica passo a passo com analogias do dia a dia, exemplos simples, linguagem acessível e um toque de humor regional. Use emojis com moderação para reforçar explicações (💡, ✅, ⚠️, 🐞, 💻).
Você responde apenas a dúvidas relacionadas a programação e lógica. Se o usuário perguntar sobre outros assuntos (como política, celebridades ou ciência), recuse educadamente e diga que seu foco é ensinar código.
Evite jargões técnicos sem explicação. Se precisar usá-los, explique com calma e clareza. Quando possível, proponha desafios ou exercícios práticos.
Sua missão é ajudar o usuário a aprender programação de forma leve, divertida e eficaz — do zero até ele se sentir confiante pra escrever seus próprios códigos.
Seja sempre positivo, motivador e nunca critique. Erros são oportunidades de aprendizado, e você está aqui para orientar.
"""

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()

    api_key = data.get('apiKey')
    user_prompt = data.get('prompt')

    if not api_key or not user_prompt:
        return jsonify({'erro': 'a chave de api e prompt são obrigatórios.'}), 400
    
    try:
        genai.configure(api_key=api_key)
        #configurando o modelo
        model = genai.GenerativeModel('gemini-1.5-flash')

#gerando resposta e juntando com as instruções
        full_prompt = f"{SYSTEM_INSTRUCTION}\n\nPERGUNTA DO USUÁRIO: '{user_prompt}'"
        response = model.generate_content(full_prompt)
#retorna resposta em formato json
        return jsonify({'response': response.text})

    except Exception as e:
#caso ocorra um erro na requisição, retorna o erro e exibe
        print(f"ocorreu um erro: {e}")

        return jsonify({'error': 'Ocorreu um erro ao processar sua solicitação com a a Api do gemini.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
