import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import YesNoDialog from './YesNoDialog';

const socket = io('http://localhost:5000');

export default function Chat({ selectedChat }) {
    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    const user = JSON.parse(localStorage.getItem('user'));

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [copied, setCopied] = useState(false);
    const [members, setMembers] = useState(0);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationCredentials);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [invitationDialog, setInvitationDialog] = useState(false);
    const [moreOptions, setMoreOptions] = useState(false);
    const [leaveGroup, setLeaveGroup] = useState(false);

    const messagesEndRef = useRef(null);

    const handleLeaveSuccess = () => {
        if (typeof window.updateChatList === 'function') {
            window.updateChatList();
        }
        if (typeof window.clearSelectedChat === 'function') {
            window.clearSelectedChat();
        }
    };

    const fetchPreviousChatMessages = async () => {
        const previousMessages = await axios.get(
            `http://localhost:5000/chat/get-messages/${selectedChat._id}`,
            axiosConfig
        );
        setMessages(previousMessages.data.messages);
    };

    const invitationCredentials = selectedChat && `chat_id: ${selectedChat._id} | passcode: ${selectedChat.passcode}`;

    useEffect(() => {
        if (messagesEndRef.current) {
           messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!selectedChat) return;

        setInvitationDialog(false);
        setMoreOptions(false);
        setLeaveGroup(false);

        fetchPreviousChatMessages();

        setMembers(selectedChat.members.length);

        socket.emit('joinRoom', selectedChat._id);

        socket.on('receiveMessage', (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (typeof window.updateChatList === 'function') {
                window.updateChatList();
            }
        });

        socket.on('updateMembers', (count) => {
            setMembers(count);
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('updateMembers');
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
                    {leaveGroup && selectedChat && (
                        <div onClick={() => setLeaveGroup(false)} className="flex justify-center items-center absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2 bg-myback250 z-150">
                            <YesNoDialog selectedChat={selectedChat} onLeaveSuccess={handleLeaveSuccess} onClose={() => setLeaveGroup(false) } />
                        </div>
                    )}
                    <div className='w-full bg-myback flex justify-between pl-10 pr-10'>
                        <div className="h-20 flex gap-3 items-center justify-baseline shadow-lg">
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
                                    {members} {members === 1 ? 'member' : 'members'}
                                </div>
                            </div>
                        </div>
                        <div className='w-50 flex gap-2 justify-end items-center relative'>
                            <div onClick={() => {setInvitationDialog(!invitationDialog); setMoreOptions(false);}} 
                                    className={`flex justify-center items-center w-10 h-10 cursor-pointer duration-200 ease-in-out hover:bg-myback2 rounded-full ${invitationDialog && 'bg-myback250'}`}>
                                <img className='w-5' src="/invite.png" alt="invite" />
                            </div>
                            {invitationDialog && (
                                <div className='absolute p-5 flex flex-col gap-5 justify-center items-center font-roboto text-white top-22 right-0 w-100 h-35 bg-myback border-4 border-myback2 rounded-2xl z-100'>
                                    <div className='w-full flex justify-center items-center gap-2'>
                                        <img className='w-4' src="/invlink.png" alt="invlink" />
                                        <p className='text-lg font-semibold'>Invitation credentials</p>
                                    </div>
                                    <div className='w-full flex justify-center items-center gap-2'>
                                        <input value={invitationCredentials} className='w-full border-2 border-white rounded-xl text-sm p-2 pl-3 pr-3 outline-0' disabled type="text" />
                                        <img onClick={copyToClipboard} className='w-6 cursor-pointer duration-200 ease-in-out hover:scale-105' src={copied ? "/copied.png" : "/copy.png"} alt="copy" />
                                        {copied && <span className="text-sm font-semibold">Copied!</span>}
                                    </div>
                                </div>
                            )}
                            <div onClick={() => {setMoreOptions(!moreOptions); setInvitationDialog(false);}} 
                                    className={`flex justify-center items-center w-10 h-10 cursor-pointer duration-200 ease-in-out hover:bg-myback2 rounded-full ${moreOptions && 'bg-myback250'}`}>
                                <img className='w-6' src="/more.png" alt="more" />
                            </div>
                            {moreOptions && (
                                <div className='absolute p-3 flex flex-col gap-1 justify-center items-center font-roboto text-white top-22 right-0 w-50 h-45 bg-myback border-4 border-myback2 rounded-2xl z-100'>
                                    <div className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                                        <img className='w-5' src="/info.png" alt="info" />
                                        <p>Group info</p>
                                    </div>
                                    <div className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                                        <img className='w-5' src="/media.png" alt="bin" />
                                        <p>Media</p>
                                    </div>
                                    <hr className='w-full h-1 border-0 bg-myback2 mt-1 mb-1 rounded-2xl' />
                                    <div onClick={() => setLeaveGroup(true)} className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                                        <img className='w-5' src="/leave.png" alt="leave" />
                                        <p className='text-red-600'>Leave a group</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-full h-6/7 overflow-y-hidden">
                        <div ref={messagesEndRef} className="p-4 flex flex-col gap-2 overflow-y-auto h-full custom-scrollbar">
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
                                                    <div className={`${isMe ? 'mt-0' : 'mt-1'}`}>{msg.body}</div>
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
                        <div className="cursor-pointer duration-200 ease-in-out hover:scale-110 bg-myback2 p-3 rounded-2xl hover:bg-myback">
                            <img className="w-5" src="/link.png" alt="" />
                        </div>
                        <input
                            className="w-2/3 h-1/2 border-2 border-white rounded-xl outline-0 font-roboto pl-5 pr-5 items-center text-white bg-myback2 duration-200 ease-in-out focus:bg-myback" 
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
                        <div onClick={sendMessage} className="cursor-pointer duration-200 ease-in-out hover:scale-110 bg-myback2 p-3 rounded-full hover:bg-myback">
                            <img className="w-5" src="/send.png" alt="" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
