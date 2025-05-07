import { useNavigate } from "react-router-dom";

export default function WelcomePage(){

    const navigate = useNavigate();

    return(
        <div className="w-screen min-h-screen h-full bg-mygreenl">
            <div className="w-screen h-screen flex flex-col gap-30 justify-center items-center">
                <div className="flex flex-col gap-5 justify-center items-center">
                    <img className="w-70" src="/logo.png" alt="logo" />
                    <h1 className="font-roboto font-bold text-3xl text-black">Pigeon</h1>
                </div>
                <div className="flex gap-10">
                    <div onClick={() => navigate('/login')} className="flex gap-1 justify-center items-center border-4 py-3 px-10 rounded-xl cursor-pointer duration-200 ease-in-out hover:scale-103">
                        <img className="w-8" src="/login.png" alt="login" />
                        <h4 className="font-roboto font-semibold text-lg">Sign in</h4>
                    </div>
                    <div onClick={() => navigate('/register')} className="flex gap-1 justify-center items-center border-4 py-3 px-10 rounded-xl cursor-pointer duration-200 ease-in-out hover:scale-103">
                        <img className="w-8" src="/register.png" alt="login" />
                        <h4 className="font-roboto font-semibold text-lg">Sign up</h4>
                    </div>
                </div>
            </div>
        </div>
    )

}