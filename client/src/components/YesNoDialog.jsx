import {useState} from 'react'
import axios from 'axios';
import Alert from "./Alert";
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function YesNoDialog({ onClose, selectedChat, onLeaveSuccess  }){

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    const [alert, setAlert] = useState(null);

    const leaveChat = async() => {
        try {
            await axios.put(`http://localhost:5000/chat/leave/${selectedChat._id}`, {}, axiosConfig);
            socket.emit('leaveRoom', selectedChat._id);
            if (onLeaveSuccess) onLeaveSuccess();
        } catch (error) {
            setAlert({ message: "Error leaving the group!", isError: true, duration: 2000 });
        }
    }

    return( 
            <>
                {alert && (
                    <Alert
                    message={alert.message}
                    isError={alert.isError}
                    duration={alert.duration}
                    onClose={() => setAlert(null)}
                    />
                )}
                <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-10 justify-between p-10 items-center w-100 h-50 rounded-2xl bg-myback shadow-2xl">
                    <div className="flex justify-center items-center gap-2 font-roboto text-2xl text-white">
                        <img className="w-7" src="/leave2.png" alt="leave" />
                        <p>Leave a group</p>
                    </div>
                    <div className="w-full h-20 flex justify-between items-center pl-10 pr-10 font-roboto text-white font-semibold">
                        <div onClick={onClose} className="p-2 pl-5 pr-5 border-4 border-white rounded-lg cursor-pointer duration-150 ease-in-out hover:bg-white hover:text-myback">
                            Cancel
                        </div>
                        <div onClick={() => {leaveChat(); onClose()}} className="p-2 pl-5 pr-5 border-4 border-red-600 text-red-600 rounded-lg cursor-pointer duration-150 ease-in-out hover:bg-red-600 hover:text-myback">
                            Leave
                        </div>
                    </div>
                </div>
            </>
    );


}