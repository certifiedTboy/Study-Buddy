import asyncio
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room
from blueprints.ai import AI
from blueprints.helpers import read_file_content
import json


app = Flask(__name__)
socketio = SocketIO(
    app,
    async_mode='threading',
    cors_allowed_origins=['http://localhost:5173'],
)


@socketio.on('connect')
def connect(auth):
    print('connect ', request.sid)

@socketio.on('joinRoom')
def handle_join_room(data):
    room = data["room"]
    join_room(room)

@socketio.on('chatMessage')
def handle_chat(data):
    query = data["text"]
    file = data.get("file")


    if file:
        buffer = file["buffer"]
        filename = file["fileName"]

        file_content = read_file_content(buffer, filename)

    
        if file_content:
            query = (
                f"{query}\n\n"
                f"{file_content}\n"
            )

    emit(
        "typing", { 'sender': 'T-AI'} , to=request.sid
    )

    try:
        ai =  AI()
        response = asyncio.run(ai.ask_ai(query))

        
        if not response:
            emit(
                'message',
                {
                    'sender': 'T-AI',
                    'text': 'This is not you, I am just having a little difficulty responding to your question at the moment!',
                },
                to=request.sid,
            )
        else:
            emit(
                'new_topic',
                {'sender' : 'T-AI', 'topic': response.get("topic")},
                to=request.sid
            )
            emit(
                'message',
                {'sender': 'T-AI', 'text': response.get("text")},
                to=request.sid,
            )
    except Exception as error:
        print(f"An error occurred: {error}")

    finally:
        emit(
            "stopTyping", {'sender': 'T-AI'}, to=request.sid
        )


if __name__ == '__main__':
    socketio.run(app, host='', port=3000)