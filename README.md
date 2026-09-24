# Study Buddy

Study Buddy is an AI-powered study assistant designed to help with academic and learning tasks in a conversational chat interface. The application accepts a question or assignment prompt, optionally includes uploaded study material, and returns a structured response tailored to the task type.

## What the application does

Study Buddy acts as a personal academic assistant for students. It can:

- answer direct questions and explain concepts
- summarize notes, readings, or pasted text
- rephrase or improve wording while preserving meaning
- help with multiple-choice questions and explain the correct option
- draft essays, discussion responses, and assignment-style work
- use uploaded files such as PDFs, DOCX files, and TXT files as context
- search for supporting online sources when needed

The user experience is a chat app with a responsive sidebar and a message stream where the AI responds in real time. A user can type a prompt, attach a file, and receive an AI-generated answer alongside a generated topic label.

## Implementation

This project is split into two main parts:

- client/: React + TypeScript frontend built with Vite
- server/: Python backend built with Flask and Socket.IO

### Frontend

The frontend is a single-page chat application built with React and Vite. It manages:

- real-time messaging with Socket.IO
- chat history and typing indicators
- file attachments for uploaded study material
- responsive layout with a sidebar and chat panel

Core frontend files:

- client/src/App.tsx
- client/src/features/chat-context.tsx
- client/src/components/chat.tsx
- client/src/components/chat-input.tsx
- client/src/components/chat-messages.tsx

### Backend

The backend is a Flask application that listens for chat events from the frontend and processes them using AI logic.

Key responsibilities:

- accept incoming text and optional uploaded file data via Socket.IO
- read file contents from PDF, DOCX, or TXT uploads
- classify the user's request (summary, rephrase, MCQ, question, essay, assignment, etc.)
- search the web for relevant sources when needed
- send the prompt and extracted context to the AI model
- return the generated response and topic back to the frontend

The backend also uses structured prompts and helper functions to:

- interpret academic assignment requirements
- load external source content
- run task-specific generation flows for essays, MCQs, summaries, and general answers

Core backend files:

- server/app.py
- server/blueprints/ai.py
- server/blueprints/helpers.py
- server/blueprints/prompts.py
- server/blueprints/models.py

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Socket.IO client/server
- Flask
- Python libraries including PyPDF, python-docx, LangChain, and Ollama-related integrations
- Google Gemini for generation
- Tavily for online search

## How it works

1. The user opens the Study Buddy chat interface.
2. They type a question or assignment prompt and can attach a file.
3. The frontend sends the payload to the Flask Socket.IO server.
4. The server reads the uploaded file if present and combines it with the user prompt.
5. The request is classified to determine the appropriate AI workflow.
6. The backend may search the web and gather supporting sources.
7. A Gemini-powered response is generated and streamed back to the client.
8. The result is displayed in the chat stream as the AI answer.

## Project structure

- client/ - frontend app
- server/ - backend API and AI logic
- README.md - project overview and setup instructions

## Setup

### Frontend

From the client directory:

```bash
npm install
npm run dev
```

### Backend

Create a virtual environment and install dependencies:

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Then create a `.env` file in the server directory with the required keys:

```env
GEMINI_API_KEY=your_google_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Run the server:

```bash
python app.py
```

The frontend is configured to connect to the backend at:

```env
VITE_SERVER_SOCKET_URL=http://127.0.0.1:3000
```

This is defined in the client `.env` file.

## Notes

This project is focused on academic support rather than general chat. It is especially useful for study workflows where the user wants help with writing, understanding material, and responding to school-related tasks with uploaded notes or documents.
