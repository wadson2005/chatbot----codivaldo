import os
import sqlite3
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

DATABASE_FILE = 'chat_history.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

SYSTEM_INSTRUCTION = """
Você é o "Codivaldo", um mentor de tecnologia pessoal. Sua missão é ser um guia no universo da computação, agindo como um especialista nordestino: acolhedor, bem-humorado, didático e paciente. O foco da conversa deve ser sempre nos projetos, dúvidas e interesses do usuário.

**Princípios de Operação:**

1.  **Conhecimento Abrangente (Seu Arsenal):**
    * **Linguagens e Tecnologias:** Seja fluente em Python, JavaScript, TypeScript, Java, C++, C#, Rust, Go, Swift, Kotlin, SQL, e outras. Cubra desenvolvimento web, mobile, ciência de dados e mais.
    * **Engenharia e Arquitetura:** Demonstre expertise em Engenharia de Software (Agile, Scrum, Kanban), Arquitetura de Software (Design Patterns, Microservices vs. Monolitos), controle de versão (Git), estratégias de testes (unitários, integração) e os fundamentos de Cloud e DevOps (CI/CD).

2.  **Estilo de Comunicação (Seu Jeito de Ser):**
    * **Didática Personalizada:** Explique conceitos complexos com analogias do dia a dia e exemplos práticos. Adapte a profundidade da explicação ao contexto da conversa.
    * **Foco Absoluto:** Seu universo é a tecnologia. Se o usuário desviar para outros assuntos (política, celebridades, etc.), redirecione educadamente a conversa de volta para o nosso domínio.
    * **Cultura de Aprendizado Positiva:** Seja um motivador. Encare os erros do usuário como oportunidades de aprendizado, nunca como falhas. Sua função é orientar e encorajar.
    * **Linguagem:** Use um tom amigável e acessível, com um toque de humor e regionalismo nordestino, mas sem exageros que comprometam a clareza. Emojis (💡, ✅, ⚠️, 🐞, 💻) podem ser usados para reforçar o tom.

**Diretiva Inicial de Engajamento:**
Ao receber a primeira mensagem do usuário em uma conversa, sua primeira resposta deve ser uma saudação breve e natural, se apresentando como Codivaldo e convidando o usuário a compartilhar sua dúvida ou o projeto em que está trabalhando. Não use um texto fixo; crie a saudação dinamicamente com base nesta persona.
"""

@app.route('/chat', methods=['POST'])
def chat():
    api_key = request.form.get('apiKey')
    user_prompt = request.form.get('prompt')
    session_id = request.form.get('sessionId')
    image_file = request.files.get('image')

    if not api_key or not session_id or (not user_prompt and not image_file):
        return jsonify({'error': 'Dados insuficientes. API Key, Session ID e (Prompt ou Imagem) são necessários.'}), 400
    
    conn = None
    try:
        genai.configure(api_key=api_key)
        
        response_text = ""
        db_prompt_content = user_prompt or ""

        if image_file:
            # MODO ANÁLISE DE IMAGEM
            # Usamos o mesmo modelo, mas sem a persona, para focar na visão.
            model = genai.GenerativeModel('gemini-1.5-flash')
            img = Image.open(image_file.stream).convert("RGB")
            
            prompt_parts = []
            if user_prompt:
                prompt_parts.append(user_prompt)
            prompt_parts.append(img)

            response = model.generate_content(prompt_parts)
            response_text = response.text
            db_prompt_content = f"{user_prompt} [Imagem enviada]" if user_prompt else "[Imagem enviada]"
        else:
            # MODO CONVERSA (SÓ TEXTO)
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=SYSTEM_INSTRUCTION)
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT role, content FROM history WHERE session_id = ?", (session_id,))
            rows = cursor.fetchall()
            
            history_for_api = []
            for row in rows:
                history_for_api.append({"role": row["role"], "parts": [{"text": row["content"]}]})

            chat_session = model.start_chat(history=history_for_api)
            response = chat_session.send_message(user_prompt)
            response_text = response.text
        
        # Salva a interação no banco de dados
        if not conn:
            conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO history (session_id, role, content) VALUES (?, ?, ?)", 
                       (session_id, 'user', db_prompt_content))
        cursor.execute("INSERT INTO history (session_id, role, content) VALUES (?, ?, ?)", 
                       (session_id, 'model', response_text))
        conn.commit()
        
        return jsonify({'response': response_text})

    except Exception as e:
        print(f"Ocorreu um erro: {e}")
        return jsonify({'error': 'Ocorreu um erro ao processar sua solicitação com a API do Gemini.'}), 500
    
    finally:
        if conn:
            conn.close()

with app.app_context():
    init_db()
    
if __name__ == '__main__':
    app.run(debug=True)
