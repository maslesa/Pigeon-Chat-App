import Chats from "../components/Chats"
import Chat from "../components/Chat"
import { useState } from "react"

export default function HomePage(){

    const [selectedChat, setSelectedChat] = useState(null);

    return(
        <div className="max-w-screen h-screen bg-myback2 flex flex-col justify-baseline items-center">
            <div className="w-full flex-1 flex justify-baseline bg-myback2">
                <Chats selectedChat={selectedChat} setSelectedChat={setSelectedChat}/>
                <Chat selectedChat={selectedChat}/>
            </div>
        </div>
    )

}