import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import Alert from "../components/Alert";


export default function LoginPage(){

    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [alert, setAlert] = useState(null);

    const login = async() => {
        try {
            const res = await axios.post(`http://localhost:5000/user/login`, {username, password});
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data));
            setAlert({ message: "Logged in successfully!", duration: 1000 });
            setTimeout(() => {
                navigate('/home');
            }, 1000);
        } catch (error) {
            setAlert({ message: "Incorrect credentials!", isError: true, duration: 2000 });
        }
    }

    return(
        <div className="w-screen min-h-screen h-full bg-myback">
            <div onClick={() => navigate('/')} className="absolute top-10 left-10 cursor-pointer duration-200 ease-in-out hover:scale-105">
                <img className="w-10" src="/back.png" alt="" />
            </div>
            {alert && (
                <Alert
                message={alert.message}
                isError={alert.isError}
                duration={alert.duration}
                onClose={() => setAlert(null)}
                />
            )}
            <div className="w-screen h-screen flex flex-col gap-15 justify-baseline items-center pt-20">
                <div className="flex flex-col gap-5 justify-center items-center">
                    <img className="w-30" src="/logo.png" alt="logo" />
                    <h1 className="font-roboto font-bold text-2xl text-white">Pigeon</h1>
                </div>
                <div className="flex flex-col gap-5 w-1/4 justify-center items-center">
                    <div className="w-full flex gap-3 items-center justify-center">
                        <label className="cursor-pointer font-roboto font-semibold text-xl text-white" htmlFor="username">Username:</label>
                        <input id="username" autoComplete="off" type="text" 
                                className="outline-0 border-3 border-white font-roboto font-semibold text-white p-1 w-full rounded-lg pl-3"
                                onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="w-full flex gap-3 items-center justify-center">
                        <label className="cursor-pointer font-roboto font-semibold text-xl text-white" htmlFor="password">Password:</label>
                        <input id="password" autoComplete="off" type="password" 
                                className="outline-0 border-3 border-white font-roboto font-semibold text-white p-1 w-full rounded-lg pl-3" 
                                onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="w-full flex items-center justify-end">
                        <a className="underline font-roboto text-sm text-white" href="/register">Do not have an account?</a>
                    </div>
                    <div onClick={() => login()} className="w-1/2 mt-5 flex items-center justify-center border-4 border-white rounded-lg font-roboto font-semibold text-white p-3 cursor-pointer
                                    duration-200 ease-in-out hover:bg-white hover:text-myback hover:border-white">
                        Login
                    </div>
                </div>
            </div>
        </div>
    )

}