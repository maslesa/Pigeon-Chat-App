import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Chat({selectedChat}){

    const user = JSON.parse(localStorage.getItem('user'));

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!selectedChat) return;

        socket.emit('joinRoom', selectedChat._id); // Join chat room

        socket.on('receiveMessage', (msg) => {
            console.log('Received:', msg);
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [selectedChat]);

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit('chatMessage', {
            chatId: selectedChat._id,
            userId: user._id,
            message: message,
        });
        setMessage('');
    };

    return(
        <>
        {selectedChat && (
            <>
            <div className="flex flex-col flex-1 bg-myback2 justify-baseline items-center">
                <div className="w-full h-21 bg-myback flex gap-3 items-center justify-baseline pl-10 pr-10 shadow-lg">
                    <div className="w-15 h-15 bg-white flex justify-center items-center rounded-full">
                        {selectedChat.backgroundImage ? (
                            <div>
                                SL
                            </div>
                        ) : (
                            <img className="w-7" src="group-chat.png" alt="" />
                        )}
                    </div>
                    <div className="flex flex-col h-15 justify-baseline font-roboto font-normal pt-1 text-white text-xl">
                        <p className="cursor-pointer duration-200 ease-in-out hover:scale-101">{selectedChat.title}</p>
                        <div className="text-sm opacity-50">{
                            selectedChat.members.length === 1 ? (
                                <div>{selectedChat.members.length} member</div>
                            ) : (
                                <div>{selectedChat.members.length} members</div>
                            )    
                        }</div>
                    </div>
                </div>
                <div className="w-full h-4/5">
                <div className="p-4 flex flex-col gap-2 overflow-y-auto h-full">
    {messages.map((msg) => {
        const isMe = msg.sentBy._id === user._id;
        return (
            <div
                key={msg._id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
                <div
                    className={`
                        max-w-xs px-4 py-2 rounded-2xl text-white text-sm shadow
                        ${isMe ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}
                    `}
                >
                    <div className="font-medium">
                        {!isMe && <span>{msg.sentBy.username}</span>}
                    </div>
                    <div>{msg.body}</div>
                </div>
            </div>
        );
    })}
</div>

                </div>
                <div className="w-full h-1/7 flex gap-5 justify-center items-center">
                        <input className="w-2/3 h-1/2 border-2 border-white rounded-xl outline-0
                                            font-roboto pl-5 items-center text-white" 
                                autoComplete="off" type="text" placeholder="Enter a message"
                                value={message}
                                onChange={e => setMessage(e.target.value)} />
                        <div onClick={sendMessage} className="cursor-pointer duration-200 ease-in-out hover:scale-110">
                            <img className="w-7" src="/send.png" alt="" />
                        </div>
                </div>
            </div>
            
            </>
        )}
        </>
        
    )

}