import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

export default function Chat({ selectedChat }) {
    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    const user = JSON.parse(localStorage.getItem('user'));

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const fetchPreviousChatMessages = async () => {
        const previousMessages = await axios.get(
            `http://localhost:5000/chat/get-messages/${selectedChat._id}`,
            axiosConfig
        );
        setMessages(previousMessages.data.messages);
    };

    useEffect(() => {
        const container = document.querySelector('.custom-scrollbar');
        if (container) container.scrollTop = container.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (!selectedChat) return;

        fetchPreviousChatMessages();

        socket.emit('joinRoom', selectedChat._id);

        socket.on('receiveMessage', (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (typeof window.updateChatList === 'function') {
                window.updateChatList();
            }
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

    function formatDateHeader(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) return 'Today';

        const isThisYear = date.getFullYear() === now.getFullYear();
        if (isThisYear) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }

        return date.getFullYear().toString();
    }

    const groupedMessages = messages.reduce((acc, msg) => {
        const dateKey = formatDateHeader(msg.createdAt);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(msg);
        return acc;
    }, {});

    return (
        <>
            {selectedChat && (
                <div className="flex flex-col max-h-screen flex-1 bg-myback2 justify-baseline items-center relative bg-cover bg-center" style={{ backgroundImage: "url('/background.png')" }} >
                    <div className="w-full h-20 bg-myback flex gap-3 items-center justify-baseline pl-10 pr-10 shadow-lg">
                        <div className="w-12 h-12 bg-white flex justify-center items-center rounded-full">
                            {selectedChat.backgroundImage ? (
                                <div>SL</div>
                            ) : (
                                <img className="w-5" src="group-chat.png" alt="" />
                            )}
                        </div>
                        <div className="flex flex-col h-15 justify-baseline font-roboto font-normal pt-1 text-white text-xl">
                            <p className="cursor-pointer duration-200 ease-in-out hover:scale-101">
                                {selectedChat.title}
                            </p>
                            <div className="text-sm opacity-50">
                                {selectedChat.members.length} {selectedChat.members.length === 1 ? 'member' : 'members'}
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-6/7 overflow-y-hidden">
                        <div className="p-4 flex flex-col gap-2 overflow-y-auto h-full custom-scrollbar">
                            {Object.keys(groupedMessages).map((dateKey) => (
                                <div key={dateKey}>
                                    <div className="flex justify-center items-center my-4">
                                        <span className="bg-gray-600 text-white text-xs px-5 py-1 rounded-full font-roboto">
                                            {dateKey}
                                        </span>
                                    </div>
                                    {groupedMessages[dateKey].map((msg) => {
                                        const isMe = msg.sentBy._id === user._id;
                                        return (
                                            <div key={msg._id} className={`flex mb-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                {!isMe && (
                                                    <div className="w-10 h-10 bg-white rounded-full mr-2 flex justify-center items-center font-roboto font-bold text-lg">
                                                        {msg.sentBy.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div
                                                    className={`relative min-w-[150px] max-w-xs px-4 py-2 pr-20 rounded-2xl text-white text-sm shadow ${
                                                        isMe
                                                            ? 'bg-blue-600 rounded-br-none'
                                                            : 'bg-gray-700 rounded-bl-none'
                                                    }`}
                                                >
                                                    <div className="font-medium">
                                                        {!isMe && <span>{msg.sentBy.username}</span>}
                                                    </div>
                                                    <div className="mt-1">{msg.body}</div>
                                                    <div className="absolute bottom-1 right-3 text-white font-roboto text-[10px] opacity-80">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full h-1/7 flex gap-5 justify-center items-center">
                        <div className="cursor-pointer duration-200 ease-in-out hover:scale-110">
                            <img className="w-5" src="/link.png" alt="" />
                        </div>
                        <input
                            className="w-2/3 h-1/2 border-2 border-white rounded-xl outline-0 font-roboto pl-5 pr-5 items-center text-white bg-myback2"
                            autoComplete="off"
                            type="text"
                            placeholder="Enter a message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    sendMessage();
                                }
                            }}
                        />
                        <div onClick={sendMessage} className="cursor-pointer duration-200 ease-in-out hover:scale-110">
                            <img className="w-7" src="/send.png" alt="" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
