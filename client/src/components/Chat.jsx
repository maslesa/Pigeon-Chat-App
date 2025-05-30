import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import YesNoDialog from './YesNoDialog';
import Alert from './Alert';

const socket = io('http://localhost:5000');

export default function Chat({ selectedChat, isNotesView, isPidgeyView }) {
    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    const user = JSON.parse(localStorage.getItem('user'));

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [copied, setCopied] = useState(false);
    const [members, setMembers] = useState(0);

    const [chatMembers, setChatMembers] = useState(null);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationCredentials);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [alert, setAlert] = useState(null);
    const [invitationDialog, setInvitationDialog] = useState(false);
    const [moreOptions, setMoreOptions] = useState(false);
    const [leaveGroup, setLeaveGroup] = useState(false);
    const [groupInfo, setGroupInfo] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [chatImageURL, setChatImageURL] = useState(selectedChat?.backgroundImage?.url);
    const [groupTitle, setGroupTitle] = useState(selectedChat?.title);
    const [titleChange, setTitleChange] = useState(false);

    const imageRef = useRef(null);
    const [image, setImage] = useState(null);

    const [selectedProfile, setSelectedProfile] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);

    const [chatMedia, setChatMedia] = useState([]);
    const [chatMediaView, setChatMediaView] = useState(false);

    const [admins, setAdmins] = useState([]);
    const [chatUserInfo, setChatUserInfo] = useState(null);

    const handleLeaveSuccess = () => {
        if (typeof window.updateChatList === 'function') {
            window.updateChatList();
        }
        if (typeof window.clearSelectedChat === 'function') {
            window.clearSelectedChat();
        }
    };

    const fetchChatMembers = async () => {
        const res = await axios.get(`http://localhost:5000/chat/fetch-members/${selectedChat._id}`, axiosConfig);
        setChatMembers(res.data.members);
    }

    const fetchPreviousChatMessages = async () => {
        const previousMessages = await axios.get(
            `http://localhost:5000/chat/get-messages/${selectedChat._id}`,
            axiosConfig
        );
        setMessages(previousMessages.data.messages);
    };

    const uploadChatImage = async (file) => {
        const formData = new FormData();
        formData.append('chatImage', file);
        try {
            const res = await axios.post(`http://localhost:5000/image/upload/chat/${selectedChat._id}`, formData, axiosConfig);
            setAlert({ message: "Group image updated!", duration: 1000 });
            setTimeout(() => {
                setChatImageURL(res.data.chatImage.url);
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.log(error);
            setAlert({ message: "Error uploading group image!", isError: true, duration: 2000 });
        }
    }

    const deleteChatImage = async () => {
        try {
            await axios.delete(`http://localhost:5000/image/delete/chatImage/${selectedChat._id}`, {
                data: { imageId: selectedChat.backgroundImage._id },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlert({ message: "Group image deleted successfully!", duration: 1000 });
            setTimeout(() => {
                setChatImageURL(null);
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.log(error);
            setAlert({ message: "Error deleting group image!", isError: true, duration: 2000 });
        }
    }

    const changeChatTitle = async () => {
        try {
            await axios.put(`http://localhost:5000/chat/change/title/${selectedChat._id}`, { newTitle: groupTitle }, axiosConfig);
            setAlert({ message: "Group title updated!", duration: 1000 });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.log(error);
            setAlert({ message: "Error changing group title!", isError: true, duration: 2000 });
        }
    }

    const fetchChatMedia = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/chat/fetch-media/${selectedChat._id}`, axiosConfig);
            setChatMedia(res.data.media);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchChatAdmins = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/chat/fetch-admins/${selectedChat._id}`, axiosConfig);
            setAdmins(res.data.admins);
        } catch (error) {
            console.log(error);
        }
    }

    const kickUserFromChat = async (kickedUser) => {
        try {
            await axios.put(`http://localhost:5000/chat/kick-user/${selectedChat._id}`, { userId: kickedUser._id }, axiosConfig);
            setAlert({ message: `${kickedUser.username} kicked from ${selectedChat.title}`, duration: 1000 });
            setMembers(members - 1);
            fetchChatMembers();
        } catch (error) {
            console.log(error);
        }
    }

    const addUserAsAdmin = async (newAdmin) => {
        try {
            await axios.put(`http://localhost:5000/chat/add-admin/${selectedChat._id}`, { newAdminId: newAdmin._id }, axiosConfig);
            setAlert({ message: `${newAdmin.username} added as admin in ${selectedChat.title}`, duration: 1000 });
            fetchChatAdmins();
        } catch (error) {
            console.log(error);
        }
    }

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
        setChatImageURL(selectedChat?.backgroundImage?.url);

        fetchPreviousChatMessages();
        fetchChatMembers();
        setGroupTitle(selectedChat.title);
        setTitleChange(false);
        setSelectedProfile(null);
        setImagePreview(null);
        fetchChatMedia();
        fetchChatAdmins();
        setChatUserInfo(null);

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
            socket.emit('leaveRoom', selectedChat._id);
            socket.off('receiveMessage');
            socket.off('updateMembers');
        };
    }, [selectedChat]);

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

    const sendMessage = async () => {
        if (!message.trim() && !image) return;

        let base64 = null;
        if (image) {
            base64 = await toBase64(image);
        }

        socket.emit('chatMessage', {
            chatId: selectedChat._id,
            userId: user._id,
            message,
            base64Image: base64,
        });

        setMessage('');
        setImage(null);

        if (base64) {
            const newImage = {
                _id: Date.now().toString(),
                url: base64,
                sentBy: user._id,
            };
            setChatMedia((prev) => [...prev, newImage]);
        }
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

    const [aiMessages, setAIMessages] = useState([]);
    const [newAIMessage, setNewAIMessage] = useState('');

    const aiEndRef = useRef(null);

    useEffect(() => {
        if (aiEndRef.current) {
            aiEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [aiMessages]);

    const groupedAIMessages = aiMessages.reduce((acc, msg) => {
        const dateKey = formatDateHeader(msg.createdAt);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(msg);
        return acc;
    }, {});

    const fetchAIMessages = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/ai/fetch-messages`, axiosConfig);
            setAIMessages(res.data.chat);
        } catch (error) {
            console.error("Failed to fetch ai mesasges:", err);
        }
    }

    const sendAIMessage = async () => {
        if (!newAIMessage.trim()) return;
        setNewAIMessage('');
        try {
            const res = await axios.post(
                'http://localhost:5000/ai/send-message',
                { messageBody: newAIMessage },
                axiosConfig
            );

            if (res.data.success) {
                const newMessages = res.data.chat;
                setAIMessages(prev => [...prev, ...newMessages]);
            }
        } catch (error) {
            console.error('Error sending AI message:', error);
        }
    };

    const groupedMessages = messages.reduce((acc, msg) => {
        const dateKey = formatDateHeader(msg.createdAt);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(msg);
        return acc;
    }, {});

    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    const groupedNotes = notes.reduce((acc, note) => {
        const dateKey = formatDateHeader(note.createdAt);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(note);
        return acc;
    }, {});

    const fetchNotes = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/note/fetch`, axiosConfig);
            setNotes(res.data.notes);
        } catch (err) {
            console.error("Failed to fetch notes:", err);
        }
    };

    const createNote = async () => {
        if (!newNote.trim()) return;
        try {
            const res = await axios.post(`http://localhost:5000/note/post`, { body: newNote }, axiosConfig);
            setNotes([...notes, res.data.note]);
            setNewNote('');
        } catch (error) {
            console.log('error', error);
        }
    }

    const noteEndRef = useRef(null);

    useEffect(() => {
        if (noteEndRef.current) {
            noteEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [notes]);

    useEffect(() => {
        if (isNotesView) {
            fetchNotes();
        }
    }, [isNotesView]);

    useEffect(() => {
        if (isPidgeyView) {
            fetchAIMessages();
        }
    }, [isPidgeyView]);

    if (isNotesView) {

        return (
            <div className="flex flex-col max-h-screen flex-1 bg-myback2 justify-baseline items-center relative bg-cover bg-center" style={{ backgroundImage: "url('/background.png')" }} >
                <div className='w-full bg-myback flex justify-between pl-10 pr-10'>
                    <div className="h-20 flex gap-3 items-center justify-baseline shadow-lg">
                        <div className="w-12 h-12 bg-white flex justify-center items-center rounded-full">
                            <img className='w-5' src="/notes.png" alt="" />
                        </div>
                        <div className="flex flex-col h-15 justify-center font-roboto font-normal pt-1 text-white text-xl">
                            <p>
                                My notes
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full h-6/7 overflow-y-hidden">
                    <div className="p-4 flex flex-col gap-2 overflow-y-auto h-full custom-scrollbar">
                        {Object.keys(groupedNotes).map((dateKey) => (
                            <div key={dateKey} className="w-full">
                                <div className="flex justify-center items-center my-4">
                                    <span className="bg-gray-600 text-white text-xs px-5 py-1 rounded-full font-roboto">
                                        {dateKey}
                                    </span>
                                </div>
                                {groupedNotes[dateKey].map((note) => (
                                    <div key={note._id} className="flex justify-end mb-2">
                                        <div className="relative min-w-[150px] max-w-xs px-4 py-2 pr-20 rounded-2xl text-white text-sm shadow bg-blue-600 rounded-br-none">
                                            <p>{note.body}</p>
                                            <div className="absolute bottom-1 right-3 text-white font-roboto text-[10px] opacity-80">
                                                {new Date(note.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div ref={noteEndRef} />
                    </div>
                </div>
                <div className="w-full h-1/7 flex gap-5 justify-center items-center">
                    <input
                        className="w-2/3 h-1/2 border-2 border-white rounded-xl outline-0 font-roboto pl-5 pr-5 items-center text-white bg-myback2 duration-200 ease-in-out focus:bg-myback"
                        autoComplete="off"
                        type="text"
                        placeholder="Enter new note"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                createNote();
                            }
                        }}
                    />
                    <div onClick={createNote} className="cursor-pointer duration-200 ease-in-out hover:scale-110 bg-myback2 p-3 rounded-full hover:bg-myback">
                        <img className="w-5" src="/send.png" alt="" />
                    </div>
                </div>
            </div>
        )
    }

    if (isPidgeyView) {
        return (
            <div className="flex flex-col max-h-screen flex-1 bg-myback2 justify-baseline items-center relative bg-cover bg-center" style={{ backgroundImage: "url('/background.png')" }} >
                <div className='w-full bg-myback flex justify-between pl-10 pr-10'>
                    <div className="h-20 flex gap-3 items-center justify-baseline shadow-lg">
                        <div className="w-12 h-12 bg-white flex justify-center items-center rounded-full">
                            <img className='w-6' src="/logo.png" alt="" />
                        </div>
                        <div className="flex flex-col h-15 justify-center font-roboto font-normal pt-1 text-white text-xl">
                            <p>
                                Pidgey AI
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full h-6/7 overflow-y-hidden">
                    <div className="p-4 flex flex-col gap-2 overflow-y-auto h-full custom-scrollbar">
                        {Object.keys(groupedAIMessages).map((dateKey) => (
                            <div key={dateKey} className="w-full">
                                <div className="flex justify-center items-center my-4">
                                    <span className="bg-gray-600 text-white text-xs px-5 py-1 rounded-full font-roboto">
                                        {dateKey}
                                    </span>
                                </div>
                                {groupedAIMessages[dateKey].map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'} mb-2`}
                                    >
                                        <div
                                            className={`relative min-w-[150px] max-w-xs px-4 py-2 pr-20 rounded-2xl text-white text-sm shadow ${msg.isAI
                                                ? 'bg-gray-700 rounded-bl-none'
                                                : 'bg-blue-600 rounded-br-none'
                                                }`}
                                        >
                                            <p>{msg.body}</p>
                                            <div className="absolute bottom-1 right-3 text-white font-roboto text-[10px] opacity-80">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div ref={aiEndRef} />
                    </div>
                </div>
                <div className="w-full h-1/7 flex gap-5 justify-center items-center">
                    <input
                        className="w-2/3 h-1/2 border-2 border-white rounded-xl outline-0 font-roboto pl-5 pr-5 items-center text-white bg-myback2 duration-200 ease-in-out focus:bg-myback"
                        autoComplete="off"
                        type="text"
                        placeholder="Get in touch with Pidgey"
                        value={newAIMessage}
                        onChange={(e) => setNewAIMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendAIMessage();
                            }
                        }}
                    />
                    <div onClick={sendAIMessage} className="cursor-pointer duration-200 ease-in-out hover:scale-110 bg-myback2 p-3 rounded-full hover:bg-myback">
                        <img className="w-5" src="/send.png" alt="" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {alert && (
                <Alert
                    message={alert.message}
                    isError={alert.isError}
                    duration={alert.duration}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="flex flex-col max-h-screen flex-1 bg-myback2 justify-baseline items-center relative bg-cover bg-center" style={{ backgroundImage: "url('/background.png')" }} >
                {selectedChat && (
                    <>
                        {imagePreview && (
                            <div onClick={() => setImagePreview(null)} className="absolute w-full h-full flex justify-center items-center z-200">
                                <div className="absolute inset-0 bg-myback2 opacity-80"></div>
                                <img
                                    className="w-80 z-30 opacity-100"
                                    src={imagePreview.url}
                                    alt="image"
                                />
                            </div>
                        )}
                        {leaveGroup && selectedChat && (
                            <div onClick={() => setLeaveGroup(false)} className="flex justify-center items-center absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2 bg-myback250 z-150">
                                <YesNoDialog selectedChat={selectedChat} onLeaveSuccess={handleLeaveSuccess} onClose={() => setLeaveGroup(false)} />
                            </div>
                        )}
                        {selectedChat && selectedProfile && (
                            <div onClick={() => { setSelectedProfile(null); setGroupInfo(true); }} className='absolute flex w-full h-full bg-myback250 z-50 font-roboto text-white'>
                                <div onClick={(e) => e.stopPropagation()} className='w-1/3 h-full bg-myback absolute right-0'>
                                    <div className='pl-5 flex gap-5 justify-baseline items-center w-full h-1/12'>
                                        <img onClick={() => { setSelectedProfile(null); setGroupInfo(true); }} className='w-5 cursor-pointer duration-200 ease-in-out hover:scale-105' src="/close.png" alt="close" />
                                        <p className='font-semibold text-xl'>User info</p>
                                    </div>
                                    <div className='w-full h-1/2 bg-white flex justify-center items-center'>
                                        {selectedProfile.profileImage ? (
                                            <img className="w-full h-full object-cover" src={selectedProfile.profileImage.url} alt="userprofileimage" />
                                        ) : (
                                            <div className="relative w-full h-full flex items-center justify-center text-myback2 text-7xl font-semibold">
                                                {selectedProfile.nameSurname.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className='w-full flex flex-col gap-3 p-7'>
                                        <p className='text-2xl'>{selectedProfile.nameSurname}</p>
                                        <p className='text-lg opacity-50'>{selectedProfile.username}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {chatMediaView && selectedChat && (
                            <div onClick={() => { setChatMediaView(false); setGroupInfo(true); }} className="flex justify-center items-center absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2 bg-myback250 z-150">
                                <div onClick={(e) => e.stopPropagation()} className="w-1/3 h-full absolute right-0 bg-myback flex flex-col font-roboto text-white">
                                    <div className="pl-5 flex gap-5 items-center w-full h-1/12">
                                        <img
                                            onClick={() => { setChatMediaView(false); setGroupInfo(true); }}
                                            className="w-5 cursor-pointer duration-200 ease-in-out hover:scale-105"
                                            src="/close.png"
                                            alt="close"
                                        />
                                        <p className="font-semibold text-xl">Media</p>
                                    </div>
                                    <div className="w-full h-full overflow-y-auto p-4 custom-scrollbar">
                                        {chatMedia.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {chatMedia.map((image) => (
                                                    <div onClick={() => { setImagePreview(image) }} key={image._id} className="w-full aspect-[1/1] overflow-hidden rounded-lg">
                                                        <img
                                                            src={image.url}
                                                            alt="chat media"
                                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 duration-200"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg text-gray-400">
                                                No media in this chat.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {groupInfo && selectedChat && (
                            <div onClick={() => setGroupInfo(false)} className='flex justify-center items-center absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2 bg-myback250 z-150'>
                                <div onClick={(e) => e.stopPropagation()} className='w-1/3 h-full absolute right-0 bg-myback flex flex-col items-baseline font-roboto text-white'>
                                    <div className='pl-5 flex gap-5 justify-baseline items-center w-full h-1/12'>
                                        <img onClick={() => setGroupInfo(false)} className='w-5 cursor-pointer duration-200 ease-in-out hover:scale-105' src="/close.png" alt="close" />
                                        <p className='font-semibold text-xl'>Group info</p>
                                    </div>
                                    <div className='w-full h-1/2 bg-white flex justify-center items-center relative'>
                                        {selectedChat.backgroundImage ? (
                                            <div className="w-full h-full flex justify-center items-center group">
                                                <img className="w-full h-full object-cover" src={chatImageURL} alt="chatimg" />
                                                <div className="absolute inset-0 bg-myback2/10 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files.length > 0) {
                                                                uploadChatImage(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <button onClick={() => fileInputRef.current.click()} className="text-lg px-4 py-2 bg-white text-myback2 font-semibold rounded-lg shadow duration-200 ease-in-out hover:bg-myback hover:text-white cursor-pointer">
                                                        Change Image
                                                    </button>
                                                    <div onClick={deleteChatImage} className='absolute p-3 bg-myback rounded-full top-5 right-5 cursor-pointer duration-200 ease-in-out hover:scale-105'>
                                                        <img className="w-5" src="/delete.png" alt="delete" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex justify-center items-center group">
                                                <img className="w-25" src="group-chat.png" alt="" />
                                                <div className="absolute inset-0 bg-myback2/10 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files.length > 0) {
                                                                uploadChatImage(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <button onClick={() => fileInputRef.current.click()} className="text-lg px-4 py-2 bg-white text-myback2 font-semibold rounded-lg shadow duration-200 ease-in-out hover:bg-myback hover:text-white cursor-pointer">
                                                        Change Image
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className='w-full p-3 pt-10 bg-[linear-gradient(to_top,_var(--color-myback2)_0%,_var(--color-myback2)_0%,_transparent_100%)] pl-2 pr-6 flex flex-col justify-center items-baseline absolute bottom-0'>
                                            <div className='w-full flex gap-3 items-center justify-between mb-1 pl-1'>
                                                <input value={groupTitle} disabled={!titleChange} className={`font-roboto text-2xl max-w-2/3 pl-3 pb-2 pt-2 rounded-lg outline-0 ${titleChange && ('border-2 border-white')}`} type="text" onChange={(e) => { setGroupTitle(e.target.value) }} />
                                                {!titleChange ? (
                                                    <img onClick={() => setTitleChange(true)} className="w-5 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/change.png" alt="change" />
                                                ) : (
                                                    <div className="flex gap-2 items-center">
                                                        <img onClick={() => { setTitleChange(false); setGroupTitle(selectedChat.title); }} className="w-8 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/cancel.png" alt="cancel" />
                                                        <img onClick={changeChatTitle} className="w-7 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/copied.png" alt="change" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className='text-sm opacity-80 pl-4'>{members} {members === 1 ? 'member' : 'members'}</p>
                                        </div>
                                    </div>
                                    <div className='w-full p-3 pl-5 pr-5 flex items-center justify-between'>
                                        <div onClick={() => { setChatMediaView(true); setGroupInfo(false); }} className='flex gap-1 items-center justify-center'>
                                            <img className='w-5 cursor-pointer' src="/media.png" alt="media" />
                                            <p className='text-lg font-medium cursor-pointer'>Media</p>
                                        </div>
                                        <div onClick={() => { setChatMediaView(true); setGroupInfo(false); }} className='flex items-center justify-center'>
                                            <img className='w-6 cursor-pointer duration-200 ease-in-out hover:scale-105' src="/open.png" alt="open" />
                                        </div>
                                    </div>
                                    <div className='w-full bg-myback p-3 pl-5 pr-5'>
                                        <div className='flex gap-1 items-center justify-baseline mb-3'>
                                            <img className='w-5 cursor-pointer' src="/members.png" alt="members" />
                                            <p className='text-lg font-medium cursor-pointer'>Members ( {members} ) </p>
                                        </div>
                                        <div className='flex flex-col pl-6 pr-3 overflow-y-auto max-h-48 custom-scrollbar'>
                                            {chatMembers &&
                                                chatMembers
                                                    .slice()
                                                    .sort((a, b) => {
                                                        const getPriority = (member) => {
                                                            if (member._id === user._id) return 0;
                                                            if (admins?.some(admin => (typeof admin === 'string' ? admin === member._id : admin._id === member._id))) return 1;
                                                            return 2;
                                                        };
                                                        return getPriority(a) - getPriority(b);
                                                    })
                                                    .map((member) => {
                                                        const isMe = member._id === user._id;
                                                        const isAdmin = admins?.some(admin => (typeof admin === 'string' ? admin === member._id : admin._id === member._id));
                                                        const isUserAdmin = admins?.some(admin => typeof admin === 'string' ? admin === user._id : admin._id === user._id);

                                                        return (
                                                            <div onClick={() => { setGroupInfo(false); setSelectedProfile(member); setChatUserInfo(null); }} key={member._id} className='p-3 flex gap-3 items-center justify-between cursor-pointer duration-200 ease-in-out hover:bg-myback2 rounded-xl'>
                                                                <div className='flex justify-baseline items-center gap-3'>
                                                                    {member.profileImage ? (
                                                                        <img src={member.profileImage.url} alt="Profile" className="w-10 h-10 object-cover rounded-full mr-2" />
                                                                    ) : (
                                                                        <div className='bg-white w-10 h-10 rounded-full flex items-center justify-center text-myback2 text-xl font-semibold'>
                                                                            {member.nameSurname[0]}
                                                                        </div>
                                                                    )}
                                                                    <p>{isMe ? 'Me' : member.username}</p>
                                                                    {isAdmin && (
                                                                        <div className="text-sm text-white ml-1 border-2 p-1 pl-3 pr-3 rounded-3xl">
                                                                            admin
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {!isMe && isUserAdmin && (
                                                                    <div onClick={(e) => { e.stopPropagation(); setChatUserInfo(chatUserInfo?._id === member._id ? null : member); }}
                                                                        className={`relative flex justify-center items-center w-10 h-10 rounded-full duration-200 ease-in-out hover:bg-myback ${chatUserInfo && chatUserInfo._id === member._id ? 'bg-myback2' : ''}`}>
                                                                        <img className="w-5" src="/more.png" alt="" />
                                                                        {chatUserInfo && chatUserInfo._id === member._id && (
                                                                            <div className={`absolute right-12 rounded-xl w-45 ${isAdmin ? 'h-30' : 'h-45'} bg-myback border-2 border-myback2 z-10 flex flex-col gap-2 p-2`}>
                                                                                <div onClick={() => { setSelectedProfile(member); setGroupInfo(false); }} className={`w-full ${isAdmin ? 'h-1/2' : 'h-1/3'} flex items-center justify-baseline gap-1 p-2 duration-200 ease-in-out bg-myback hover:bg-myback2 rounded-lg`}>
                                                                                    <img className="w-5" src="/login.png" alt="userinfo" />
                                                                                    <p className="font-roboto text-white text-lg">User info</p>
                                                                                </div>
                                                                                {!isAdmin && (
                                                                                    <div onClick={() => addUserAsAdmin(member)} className="w-full h-1/3 flex items-center justify-baseline gap-1 p-2 duration-200 ease-in-out bg-myback hover:bg-myback2 rounded-lg">
                                                                                        <img className="w-5" src="/admin.png" alt="userinfo" />
                                                                                        <p className="font-roboto text-lg text-white">Add as admin</p>
                                                                                    </div>
                                                                                )}
                                                                                <div onClick={() => { kickUserFromChat(member); setChatUserInfo(null); }} className={`w-full ${isAdmin ? 'h-1/2' : 'h-1/3'} flex items-center justify-baseline gap-1 p-2 duration-200 ease-in-out bg-myback hover:bg-myback2 rounded-lg`}>
                                                                                    <img className="w-5" src="/kick.png" alt="userinfo" />
                                                                                    <p className="font-roboto text-lg text-red-700">Kick</p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className='w-full bg-myback flex justify-between pl-10 pr-10'>
                            <div className="h-20 flex gap-3 items-center justify-baseline shadow-lg">
                                <div onClick={() => setGroupInfo(true)} className="w-12 h-12 bg-white flex justify-center items-center rounded-full cursor-pointer">
                                    {selectedChat.backgroundImage ? (
                                        <div className="w-13 h-13 rounded-full">
                                            <img className="w-13 h-13 object-cover rounded-full" src={chatImageURL} alt="chatimg" />
                                        </div>
                                    ) : (
                                        <img className="w-5" src="group-chat.png" alt="" />
                                    )}
                                </div>
                                <div className="flex flex-col h-15 justify-baseline font-roboto font-normal pt-1 text-white text-xl">
                                    <p onClick={() => setGroupInfo(true)} className="cursor-pointer duration-200 ease-in-out hover:scale-101">
                                        {selectedChat.title}
                                    </p>
                                    <div className="text-sm opacity-50">
                                        {members} {members === 1 ? 'member' : 'members'}
                                    </div>
                                </div>
                            </div>
                            <div className='w-50 flex gap-2 justify-end items-center relative'>
                                <div onClick={() => { setInvitationDialog(!invitationDialog); setMoreOptions(false); }}
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
                                <div onClick={() => { setMoreOptions(!moreOptions); setInvitationDialog(false); }}
                                    className={`flex justify-center items-center w-10 h-10 cursor-pointer duration-200 ease-in-out hover:bg-myback2 rounded-full ${moreOptions && 'bg-myback250'}`}>
                                    <img className='w-6' src="/more.png" alt="more" />
                                </div>
                                {moreOptions && (
                                    <div className='absolute p-3 flex flex-col gap-1 justify-center items-center font-roboto text-white top-22 right-0 w-50 h-45 bg-myback border-4 border-myback2 rounded-2xl z-100'>
                                        <div onClick={() => { setMoreOptions(false); setGroupInfo(true); }} className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                                            <img className='w-5' src="/info.png" alt="info" />
                                            <p>Group info</p>
                                        </div>
                                        <div onClick={() => setChatMediaView(true)} className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
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
                                                        msg.sentBy.profileImage?.url ? (
                                                            <img onClick={() => setSelectedProfile(msg.sentBy)} src={msg.sentBy.profileImage.url} alt="Profile" className="w-10 h-10 object-cover rounded-full mr-2 cursor-pointer" />
                                                        ) : (
                                                            <div onClick={() => setSelectedProfile(msg.sentBy)} className="w-10 h-10 bg-white rounded-full mr-2 flex justify-center items-center font-roboto font-bold text-lg cursor-pointer">
                                                                {msg.sentBy.nameSurname.charAt(0).toUpperCase()}
                                                            </div>
                                                        )
                                                    )}
                                                    <div
                                                        className={`relative min-w-[150px] max-w-xs px-4 py-2 pr-20 rounded-2xl text-white text-sm shadow ${isMe
                                                            ? 'bg-blue-600 rounded-br-none'
                                                            : 'bg-gray-700 rounded-bl-none'
                                                            }`}
                                                    >
                                                        <div onClick={() => setSelectedProfile(msg.sentBy)} className="font-medium cursor-pointer">
                                                            {!isMe && <span>{msg.sentBy.username}</span>}
                                                        </div>
                                                        <div className={`${isMe ? 'mt-0' : 'mt-1'}`}>
                                                            {msg.image && (
                                                                <div onClick={() => setImagePreview(msg.image)} className='w-full cursor-pointer relative group m-2'>
                                                                    <div className='absolute inset-0 bg-myback2 bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-xl'>
                                                                        <img className='w-10' src="/camera.png" alt="camera" />
                                                                    </div>
                                                                    <img
                                                                        src={msg.image.url}
                                                                        alt="messageimg"
                                                                        className="w-max rounded-xl mb-1 "
                                                                    />
                                                                </div>
                                                            )}
                                                            {msg.body}
                                                        </div>
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
                        {chatMembers && chatMembers.some(member => member._id === user._id) ? (
                            <div className="w-full h-1/7 flex gap-5 justify-center items-center relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={imageRef}
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            setImage(e.target.files[0]);
                                        }
                                    }}
                                />
                                <div onClick={() => imageRef.current.click()} className="cursor-pointer duration-200 ease-in-out hover:scale-110 bg-myback2 p-3 rounded-2xl hover:bg-myback">
                                    <img className="w-5" src="/link.png" alt="" />
                                </div>
                                {image && (
                                    <div className="w-2/3 flex justify-baseline items-baseline mb-2 absolute bottom-20">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt="preview"
                                            className="max-h-18 rounded-lg object-contain"
                                        />
                                        <div onClick={() => setImage(null)} className='bg-myback p-2 absolute top-1 left-19 cursor-pointer rounded-full'>
                                            <img className='w-3' src="/closeimg.png" alt="closeimage" />
                                        </div>
                                    </div>
                                )}
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
                        ) : (
                            <div className="w-full h-1/7 flex justify-center items-center relative">
                                <p className='font-roboto text-white text-xl'>You are not a member of this chat anymore!</p>
                            </div>
                        )}

                    </>
                )}
            </div>
        </>
    );
}
