from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai
import sqlite3

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
Ao receber a primeira mensagem do usuário em uma conversa, sua primeira resposta deve ser uma saudação breve e natural, se apresentando como Codivaldo e convidando o usuário a compartilhar sua dúvida ou o projeto em que está trabalhando. Não use um texto fixo; crie a saudação dinamicamente com base nesta pers
"""

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()

    api_key = data.get('apiKey')
    user_prompt = data.get('prompt')
    session_id = data.get('sessionId')

    if not all([api_key, user_prompt, session_id]):
        return jsonify({'error': 'A chave da API, o prompt e o ID da sessão são obrigatórios.'}), 400
    
    try:
        genai.configure(api_key=api_key)
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

        cursor.execute("INSERT INTO history (session_id, role, content) VALUES (?, ?, ?)", 
                       (session_id, 'user', user_prompt))
        cursor.execute("INSERT INTO history (session_id, role, content) VALUES (?, ?, ?)", 
                       (session_id, 'model', response.text))
        conn.commit()
        conn.close()
        
        return jsonify({'response': response.text})

    except Exception as e:
        print(f"Ocorreu um erro: {e}")
        return jsonify({'error': 'Ocorreu um erro ao processar sua solicitação com a API do Gemini.'}), 500

with app.app_context():
    init_db()
    
if __name__ == '__main__':
    app.run(debug=True)
