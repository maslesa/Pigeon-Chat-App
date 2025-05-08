import { useEffect, useState } from "react";
import axios from 'axios';
import NewChat from "./NewChat";

export default function Chats({ setSelectedChat }){

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization : `Bearer ${token}` }}

    const [chats, setChats] = useState([]);
    const [newChatDialog, setNewChatDialog] = useState(false);

    const fetchChats = async() => {
        const res = await axios.get(`http://localhost:5000/chat/fetch-all`, axiosConfig);
        setChats(res.data.chats);
    }

    useEffect(() => {
        fetchChats();
    }, []);

    return(
        <div className="w-1/4 h-full flex flex-col items-center bg-myback shadow-2xl border-r-1 border-white">
            {newChatDialog && (
                <div onClick={() => setNewChatDialog(false)} className="absolute flex justify-center items-center top-0 left-0 w-screen h-screen bg-black50 z-50">
                    <NewChat onChatCreated={() => {
                        fetchChats();
                        setNewChatDialog(false);
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
                    <div className="cursor-pointer duration-200 ease-in-out hover:scale-105">
                        <img className="w-7" src="/join.png" alt="group" />
                    </div>
                </div>
            </div>
            <div className="w-full p-5 grid grid-cols-1 gap-1">
                {chats && chats.length > 0 ? (
                    chats.map((chat) => {
                        return(
                            <div onClick={() => setSelectedChat(chat)} key={chat._id} className="w-full h-21 flex items-center pl-3 gap-3 duration-200 ease-in-out cursor-pointer
                                                        hover:bg-black50 rounded-2xl">
                                <div className="w-15 h-15 bg-white flex justify-center items-center rounded-full">
                                    {chat.backgroundImage ? (
                                        <div>
                                            SL
                                        </div>
                                    ) : (
                                        <img className="w-7" src="group-chat.png" alt="" />
                                    )}
                                </div>
                                <div className="flex flex-col h-15 justify-baseline font-roboto font-normal text-white">
                                    <p>{chat.title}</p>
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