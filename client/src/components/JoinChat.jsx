import { useState } from "react"
import axios from 'axios';
import Alert from "./Alert";

export default function JoinChat({onJoinedChat}){

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization : `Bearer ${token}` }}

    const [credentials, setCredentials] = useState('');
    const [alert, setAlert] = useState(null);

    const joinChat = async() => {
        try {
            const parts = credentials.split('|');

            const chatId = parts[0].split(':')[1].trim();
            const passcode = parts[1].split(':')[1].trim();

            await axios.put(`http://localhost:5000/chat/join/${chatId}`, {passcode}, axiosConfig);
            if(onJoinedChat) onJoinedChat();

        } catch (error) {
            console.log(error);
            
            setAlert({ message: "Incorrect credentials", isError: true, duration: 2000 });
        }
    }

    return(
        <div onClick={(e) => e.stopPropagation()} className="w-1/3 h-1/3 bg-myback2 rounded-3xl flex flex-col shadow-2xl">
            {alert && (
                <Alert
                message={alert.message}
                isError={alert.isError}
                duration={alert.duration}
                onClose={() => setAlert(null)}
                />
            )}
            <div className="w-full flex justify-center items-center p-8 gap-1">
                <img className="w-10" src="/join.png" alt="" />
                <p className="font-roboto font-semibold text-2xl text-white">Join chat</p>
            </div>
            <div className="w-full flex gap-3 justify-center items-center mb-1">
                <label className="font-roboto font-semibold text-lg text-white cursor-pointer" htmlFor="title">Chat credentials:</label>
                <input onChange={(e) => setCredentials(e.target.value)} className="w-1/2 border-2 border-white font-roboto text-white outline-0 p-2 pl-3 rounded-lg" id="title" autoComplete="off" type="text" />
            </div>
            <div className="w-full flex justify-center items-center p-5">
                <button onClick={joinChat} className="w-1/5 border-2 border-white rounded-lg p-2 font-roboto text-white
                                    duration-200 ease-in-out hover:bg-white hover:text-myback2 cursor-pointer" >
                    Join
                </button>
            </div>
        </div>
    )

}