import { useNavigate } from 'react-router-dom';

export default function Header(){

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));

    return(
        <div className="w-full h-25 max-w-screen flex items-center justify-between px-20">
            <div onClick={() => navigate('/home')} className="flex gap-1 items-center justify-center cursor-pointer">
                <img className="w-15" src="/logo.png" alt="logo" />
                <h2 className="font-roboto font-semibold text-xl text-white">Pigeon</h2>
            </div>
            <div className='flex justify-center items-center p-3 border-3 w-12 h-12 font-roboto font-semibold text-xl text-white rounded-[500px] cursor-pointer
                            duration-200 ease-in-out hover:scale-105 hover:bg-white hover:text-myback2 hover:border-white'>
                {user.nameSurname.charAt(0).toUpperCase()}
            </div>
        </div>
    )

}