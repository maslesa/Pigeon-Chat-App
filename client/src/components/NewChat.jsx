import { useState } from "react"
import axios from 'axios';
import Alert from "./Alert";

export default function NewChat({onChatCreated}){

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization : `Bearer ${token}` }}

    const [title, setTitle] = useState('');

    const [alert, setAlert] = useState(null);

    const createChat = async() => {
        try {
            if(title.length < 3){
                setAlert({ message: "Chat title must have at least 3 chars!", isError: true, duration: 2000 });
                return;
            }
            await axios.post(`http://localhost:5000/chat/create`, {title}, axiosConfig);
            if(onChatCreated) onChatCreated();
        } catch (error) {
            setAlert({ message: "Error creating new chat!", isError: true, duration: 2000 });
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
                <img className="w-10" src="/group.png" alt="" />
                <p className="font-roboto font-semibold text-2xl text-white">Create new chat</p>
            </div>
            <div className="w-full flex gap-3 justify-center items-center mb-1">
                <label className="font-roboto font-semibold text-lg text-white cursor-pointer" htmlFor="title">Chat title:</label>
                <input onChange={(e) => setTitle(e.target.value)} className="w-1/2 border-2 border-white font-roboto text-white outline-0 p-2 pl-3 rounded-lg" id="title" autoComplete="off" type="text" />
            </div>
            <div className="w-full flex justify-center items-center p-5">
                <button onClick={createChat} className="w-1/5 border-2 border-white rounded-lg p-2 font-roboto text-white
                                    duration-200 ease-in-out hover:bg-white hover:text-myback2 cursor-pointer" >
                    Create
                </button>
            </div>
        </div>
    )

}