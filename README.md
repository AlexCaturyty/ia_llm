# 🌐 Assistente DIVERSA — Inteligência Artificial para Educação Inclusiva

Bem-vindo ao repositório do **Assistente DIVERSA**, uma solução de Inteligência Artificial desenvolvida como Trabalho de Conclusão de Curso (TCC) para facilitar o acesso à informação sobre Educação Inclusiva. 

O assistente utiliza técnicas de **RAG (Retrieval-Augmented Generation)** para buscar respostas exclusivas e confiáveis extraídas do [Portal Diversa](https://diversa.org.br/) (Instituto Rodrigo Mendes), garantindo que as informações fornecidas sejam precisas e validadas educacionalmente.

---

## ✨ Funcionalidades

* 💬 **Chatbot Inteligente:** Responde dúvidas sobre autismo, TDAH, legislação educacional (LBI, LDB), práticas pedagógicas, entre outros.
* 📚 **Base de Dados Confiável (RAG):** As respostas são embasadas estritamente em artigos pré-selecionados do Portal Diversa.
* 🎭 **Perfis de Resposta Customizáveis:** A interface permite que o usuário escolha como quer a resposta:
  * **Professor:** Resposta pedagógica e detalhada.
  * **Família:** Linguagem simples, acessível e acolhedora.
  * **Gestor:** Resposta técnica, objetiva e direta ao ponto.
* 💾 **Histórico de Conversas:** O frontend salva o histórico de chats localmente (Local Storage) e o envia para a IA, garantindo a memória e o contexto da conversa.
* 📱 **Design Responsivo e Moderno:** Interface "Light Mode" limpa e profissional, adaptada perfeitamente para Desktop, Tablets e Mobile, inspirada em plataformas como Claude e Gemini.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi dividido em um ecossistema moderno, separando as responsabilidades de Front-end e Back-end.

### Front-end (Interface do Usuário)
* **[React](https://react.dev/) + [Vite](https://vitejs.dev/):** Biblioteca principal e *bundler* ultrarrápido.
* **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática para garantir a integridade dos dados (mensagens, perfis e requisições).
* **[TanStack Query (React Query)](https://tanstack.com/query/latest):** Gerenciamento de estado assíncrono e mutações para as requisições do chat.
* **[Axios](https://axios-http.com/):** Cliente HTTP para comunicação com o backend.
* **[React Markdown](https://github.com/remarkjs/react-markdown):** Renderização segura das respostas formatadas geradas pela IA.
* **CSS Modules:** Estilização componentizada e responsiva.

### Back-end (Motor de IA e RAG)
* **[Python](https://www.python.org/) + [Flask](https://flask.palletsprojects.com/):** API leve para servir a aplicação.
* **[Scikit-Learn (TF-IDF)](https://scikit-learn.org/):** Vetorização de texto e cálculo de Similaridade de Cosseno para o motor de busca (RAG).
* **[Groq API](https://groq.com/):** Provedor de inferência ultrarrápida.
* **Llama 3.1 (8B):** Modelo de Linguagem de Grande Escala (LLM) *open-source* da Meta utilizado para gerar as respostas finais.

---

## 🚀 Como Executar o Projeto

Para rodar a aplicação completa, você precisará iniciar o Back-end e o Front-end.

### 1. Configurando o Back-end (Python/Flask)
Se estiver executando via **Google Colab** (como no protótipo):
1. Abra o Notebook do projeto (`soulcode_tcc_Pilares_da_criacao...`).
2. Adicione a sua chave de API da Groq na variável de ambiente.
3. Execute todas as células até o servidor Flask iniciar com o Ngrok.
4. **Copie a URL pública gerada pelo Ngrok** (ex: `https://xxxx-xxx.ngrok-free.dev`).

### 2. Configurando o Front-end (React)

**Pré-requisitos:** Você precisa ter o [Node.js](https://nodejs.org/) instalado na sua máquina.

1. Clone o repositório ou navegue até a pasta do projeto via terminal:
   ```bash
   cd ia_llm
    ```
2. Atualize a URL do Back-end:
Abra o arquivo src/lib/axios.ts e cole a URL do Ngrok (ou do seu servidor local) na propriedade baseURL:
```bash
export const api = axios.create({
  baseURL: 'COLE_A_URL_DO_SEU_BACKEND_AQUI',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
  ```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev -- --host
```
4. O terminal informará o link local (geralmente http://localhost:5173/). Basta clicar ou copiar e colar no navegador para acessar o Assistente DIVERSA.

👥 Agradecimentos e Contexto
Este projeto foi desenvolvido como parte de um Trabalho de Conclusão de Curso (TCC).
A base de dados textual pertence ao Instituto Rodrigo Mendes (Portal Diversa), utilizada estritamente para fins educacionais de prova de conceito.

Feito com 💜 para transformar a Educação Inclusiva através da tecnologia.