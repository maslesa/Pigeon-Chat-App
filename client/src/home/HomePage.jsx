import Chats from "../components/Chats"
import Chat from "../components/Chat"
import { useState } from "react"

export default function HomePage(){

    const [selectedChat, setSelectedChat] = useState(null);
    const [isNotesView, setIsNotesView] = useState(false);
    const [isPidgeyView, setIsPidgeyView] = useState(false);

    return(
        <div className="max-w-screen h-screen bg-myback2 flex">
            <div className="w-full flex-1 flex justify-baseline bg-myback2 bg-cover bg-center" style={{ backgroundImage: "url('/background.png')" }}>
                <Chats selectedChat={selectedChat} setSelectedChat={setSelectedChat} setIsNotesView={setIsNotesView} setIsPidgeyView={setIsPidgeyView}/>
                <Chat selectedChat={selectedChat} isNotesView={isNotesView} isPidgeyView={isPidgeyView} />
            </div>
        </div>
    )

}