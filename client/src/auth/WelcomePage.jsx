import { useNavigate } from "react-router-dom";

export default function WelcomePage(){

    const navigate = useNavigate();

    return(
        <div className="w-screen min-h-screen h-full bg-myback">
            <div className="w-screen h-screen flex flex-col gap-30 justify-center items-center">
                <div className="flex flex-col gap-5 justify-center items-center">
                    <img className="w-50" src="/logo.png" alt="logo" />
                    <h1 className="font-roboto font-bold text-3xl text-white">Pigeon</h1>
                </div>
                <div className="flex gap-10">
                    <div onClick={() => navigate('/login')} className="flex gap-1 justify-center items-center border-4 border-white py-3 px-10 rounded-xl cursor-pointer duration-200 ease-in-out hover:scale-103">
                        <img className="w-8" src="/login.png" alt="login" />
                        <h4 className="font-roboto font-semibold text-lg text-white">Sign in</h4>
                    </div>
                    <div onClick={() => navigate('/register')} className="flex gap-1 justify-center items-center border-4 border-white py-3 px-10 rounded-xl cursor-pointer duration-200 ease-in-out hover:scale-103">
                        <img className="w-8" src="/register.png" alt="login" />
                        <h4 className="font-roboto font-semibold text-lg text-white">Sign up</h4>
                    </div>
                </div>
            </div>
        </div>
    )

}