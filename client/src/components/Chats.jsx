import { useEffect, useState } from "react";
import axios from 'axios';
import NewChat from "./NewChat";
import JoinChat from "./JoinChat";

export default function Chats({ selectedChat, setSelectedChat }){

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization : `Bearer ${token}` }}

    const [chats, setChats] = useState([]);
    const [newChatDialog, setNewChatDialog] = useState(false);
    const [joinChatDialog, setJoinChatDiaog] = useState(false);

    const fetchChats = async() => {
        const res = await axios.get(`http://localhost:5000/chat/fetch-all`, axiosConfig);

        const sortedChats = res.data.chats.sort((a, b) => {
            const lastMsgA = a.messages[a.messages.length - 1];
            const lastMsgB = b.messages[b.messages.length - 1];

            const dateA = lastMsgA ? new Date(lastMsgA.createdAt) : new Date(a.createdAt);
            const dateB = lastMsgB ? new Date(lastMsgB.createdAt) : new Date(b.createdAt);

            return dateB - dateA;
        });

        setChats(sortedChats);
    }

    useEffect(() => {
        window.updateChatList = fetchChats;
        window.clearSelectedChat = () => {
            setSelectedChat(null);
        };
        return () => {
            window.updateChatList = null;
            window.clearSelectedChat = null;
        }
    }, []);

    function formatMessageDate(createdAt) {
        const date = new Date(createdAt);
        const now = new Date();

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        const isThisYear = date.getFullYear() === now.getFullYear();

        if (isThisYear) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }

        return date.getFullYear();
}

    useEffect(() => {
        fetchChats();
    }, []);

    return(
        <div className="w-1/4 h-full flex flex-col bg-myback shadow-2xl border-r-1 border-white">
            {newChatDialog && (
                <div onClick={() => setNewChatDialog(false)} className="absolute flex justify-center items-center top-0 left-0 w-screen h-screen bg-black50 z-50">
                    <NewChat onChatCreated={() => {
                        fetchChats();
                        
                        setNewChatDialog(false);
                    }}/>
                </div>
            )}
            {joinChatDialog && (
                <div onClick={() => setJoinChatDiaog(false)} className="absolute flex justify-center items-center top-0 left-0 w-screen h-screen bg-black50 z-50">
                    <JoinChat onJoinedChat={() => {
                        fetchChats();
                        setJoinChatDiaog(false);
                    }}/>
                </div>
            )}
            <div className="w-full flex justify-between items-end p-5 font-roboto font-bold text-2xl text-white"> 
                <div className="flex gap-3 justify-center items-center">
                    <img className="w-5 cursor-pointer duration-200 ease-in-out hover:scale-105" src="/menu.png" alt="" />
                    <p>Chats</p>
                </div>
                <div className="flex gap-3">
                    <div onClick={() => setNewChatDialog(true)} className="cursor-pointer duration-200 ease-in-out hover:scale-105">
                        <img className="w-7" src="/group.png" alt="group" />
                    </div>
                    <div onClick={() => setJoinChatDiaog(true)} className="cursor-pointer duration-200 ease-in-out hover:scale-105">
                        <img className="w-7" src="/join.png" alt="group" />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-1 custom-scrollbar">
                {chats && chats.length > 0 ? (
                    chats.map((chat) => {
                        return(
                            <div onClick={() => setSelectedChat(chat)} key={chat._id} className={`w-full min-h-21 flex items-center pl-3 gap-3 duration-200 ease-in-out cursor-pointer
                                                         rounded-2xl  ${selectedChat && selectedChat._id === chat._id ? 'bg-myback2' : 'hover:bg-black50'}`}>
                                <div className="min-w-13 h-13 bg-white flex justify-center items-center rounded-full">
                                    {chat.backgroundImage ? (
                                        <div>
                                            SL
                                        </div>
                                    ) : (
                                        <img className="w-5" src="group-chat.png" alt="" />
                                    )}
                                </div>
                                <div className="w-full flex flex-col h-15 justify-center font-roboto font-normal text-white pr-3">
                                    <div className="flex justify-between items-center">
                                        <p>{chat.title}</p>
                                        <p className="text-xs ">{chat.messages.length > 0 && formatMessageDate(chat.messages[chat.messages.length - 1].createdAt)}</p>
                                    </div>
                                    <p className="text-sm opacity-80 truncate max-w-[12rem]">
                                        {chat.messages && chat.messages.length > 0
                                            ? `${chat.messages[chat.messages.length - 1].sentBy.username}: ${chat.messages[chat.messages.length - 1].body}`
                                            : 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex gap-1 w-full justify-center items-center">
                        <img className="w-5 opacity-50" src="/no-chats.png" alt="" />
                        <p className="font-roboto font-normal text-lg text-white opacity-50">No chats found...</p>
                    </div>
                )}
            </div>
        </div>
    );

}