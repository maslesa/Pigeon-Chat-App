import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import NewChat from "./NewChat";
import JoinChat from "./JoinChat";
import Alert from "./Alert";
import { useNavigate } from 'react-router-dom'

export default function Chats({ selectedChat, setSelectedChat }) {

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } }
    const user = JSON.parse(localStorage.getItem('user'));

    const [alert, setAlert] = useState(null);
    const [chats, setChats] = useState([]);
    const [newChatDialog, setNewChatDialog] = useState(false);
    const [joinChatDialog, setJoinChatDiaog] = useState(false);

    const [userMenu, setUserMenu] = useState(false);
    const [accountSettings, setAccountSettings] = useState(false);
    const [securitySettings, setSecuritySettings] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [changeNameSurnameToggle, setChangeNameSurnameToggle] = useState(false);
    const [newNameSurname, setNewNameSurname] = useState(user.nameSurname);
    const [newNameFirstLetter, setNewNameFirstLetter] = useState(user.nameSurname.charAt(0).toUpperCase());
    const [newUsername, setNewUsername] = useState(user.username);
    const [newUsernameToggle, setNewUsernameToggle] = useState(false);
    const fileInputRef = useRef(null);
    const [profileImageURL, setProfileImageURL] = useState(user.profileImage?.url);

    const fetchChats = async () => {
        const res = await axios.get(`http://localhost:5000/chat/fetch-all`, axiosConfig);

        const sortedChats = res.data.chats.sort((a, b) => {
            const lastMsgA = a.messages[a.messages.length - 1];
            const lastMsgB = b.messages[b.messages.length - 1];

            const dateA = lastMsgA ? new Date(lastMsgA.createdAt) : new Date(a.createdAt);
            const dateB = lastMsgB ? new Date(lastMsgB.createdAt) : new Date(b.createdAt);

            return dateB - dateA;
        });

        setChats(sortedChats);
    }

    const changePassword = async () => {
        try {
            if (newPassword != confirmNewPassword) {
                setAlert({ message: "New passwords don't match", isError: true, duration: 2000 });
                return;
            }
            await axios.put(`http://localhost:5000/user/password/change`, { oldPassword, newPassword }, axiosConfig);
            setAlert({ message: "Password changed successfully!", duration: 2000 });
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            console.log(error);
            setAlert({ message: "Invalid new password format!", isError: true, duration: 2000 });
        }
    }

    const changeNameSurname = async () => {
        try {
            if (newNameSurname.length < 3) {
                setAlert({ message: "Full name has to be min 2 characters long", isError: true, duration: 2000 });
                return;
            }
            await axios.put(`http://localhost:5000/user/nameSurname/change`, { newNameSurname }, axiosConfig);
            setChangeNameSurnameToggle(false);
            user.nameSurname = newNameSurname;
            localStorage.setItem('user', JSON.stringify(user));
            setNewNameFirstLetter(user.nameSurname.charAt(0).toUpperCase());
            setAlert({ message: "Full name changed successfully!", duration: 2000 });
            setNewNameSurname(user.nameSurname);
        } catch (error) {
            console.log(error);
            setAlert({ message: "Invalid new full name format!", isError: true, duration: 2000 });
        }
    }

    const changeUsername = async () => {
        try {
            if (newUsername.length < 3) {
                setAlert({ message: "Full name has to be min 2 characters long", isError: true, duration: 2000 });
                return;
            }
            await axios.put(`http://localhost:5000/user/username/change`, { newUsername: newUsername }, axiosConfig);
            setNewUsernameToggle(false);
            user.username = newUsername;
            localStorage.setItem('user', JSON.stringify(user));
            setAlert({ message: "Username changed successfully!", duration: 2000 });
            setNewUsername(user.username);
        } catch (error) {
            console.log(error);
            setAlert({ message: "User with that username already exists!", isError: true, duration: 2000 });
        }
    }

    const uploadProfileImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post(`http://localhost:5000/image/upload`, formData, axiosConfig);
            const updatedUser = { ...user, profileImage: res.data.image.url };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setProfileImageURL(res.data.image.url);
            setAlert({ message: "Profile image updated!", duration: 2000 });
        } catch (error) {
            console.log(error);
            setAlert({ message: "Error uploading profile image!", isError: true, duration: 2000 });
        }
    }

    useEffect(() => {
        window.updateChatList = fetchChats;
        window.clearSelectedChat = () => {
            setSelectedChat(null);
        };
        return () => {
            window.updateChatList = null;
            window.clearSelectedChat = null;
        }
    }, []);

    function formatMessageDate(createdAt) {
        const date = new Date(createdAt);
        const now = new Date();

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        const isThisYear = date.getFullYear() === now.getFullYear();

        if (isThisYear) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }

        return date.getFullYear();
    }

    useEffect(() => {
        fetchChats();
    }, []);

    return (
        <div className="w-1/4 h-full flex flex-col bg-myback shadow-2xl border-r-1 border-white relative">
            {alert && (
                <Alert
                    message={alert.message}
                    isError={alert.isError}
                    duration={alert.duration}
                    onClose={() => setAlert(null)}
                />
            )}
            {userMenu && (
                <div onClick={() => setUserMenu(false)} className="w-full h-full absolute bg-myback250 z-200">
                    <div onClick={(e) => e.stopPropagation()} className="flex flex-col p-3 absolute left-4 top-15 w-60 bg-myback border-4 border-myback2 rounded-2xl font-roboto text-white">
                        <div onClick={() => { setUserMenu(false); setAccountSettings(true); }} className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                            <img className='w-5' src="/login.png" alt="acc" />
                            <p>Account settings</p>
                        </div>
                        <hr className='w-full h-1 border-0 bg-myback2 mt-1 mb-1 rounded-2xl' />
                        <div onClick={() => { setSecuritySettings(true); setUserMenu(false); }} className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                            <img className='w-5' src="/password.png" alt="acc" />
                            <p>Security settings</p>
                        </div>
                        <div className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                            <img className='w-5' src="/moon.png" alt="nightmode" />
                            <p>Night mode</p>
                        </div>
                        <div className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                            <img className='w-5' src="/thinking.png" alt="thinking" />
                            <p>My notes</p>
                        </div>
                        <div className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-between items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                            <div className="flex gap-2">
                                <img className='w-5' src="/logo.png" alt="thinking" />
                                <p>Pidgey AI</p>
                            </div>
                            <div className="w-12 flex justify-center items-center rounded-full font-semibold text-xs p-1 bg-pink-700">
                                NEW
                            </div>
                        </div>
                        <hr className='w-full h-1 border-0 bg-myback2 mt-1 mb-1 rounded-2xl' />
                        <div onClick={() => navigate('/login')} className='w-full p-2 pl-3 rounded-lg cursor-pointer flex justify-baseline items-center gap-2 duration-200 ease-in-out hover:bg-myback2'>
                            <img className='w-5' src="/leave2.png" alt="acc" />
                            <p>Log out</p>
                        </div>
                        <div className="pl-3 flex justify-baseline items-center mt-5 text-sm opacity-50">
                            &copy; Pigeon 1.01.10
                        </div>

                    </div>
                </div>
            )}
            {accountSettings && (
                <div className="w-full h-full absolute bg-myback z-200 font-roboto text-white">
                    <div className='pl-5 flex gap-5 justify-baseline items-center w-full h-1/12'>
                        <img onClick={() => setAccountSettings(false)} className='w-5 cursor-pointer duration-200 ease-in-out hover:scale-105' src="/close.png" alt="close" />
                        <p className='font-semibold text-xl'>Account settings</p>
                    </div>
                    <div className='w-full h-1/2 bg-white flex justify-center items-center relative'>
                        {user.profileImage ? (
                            <div className="relative w-full h-full group">
                                <img src={profileImageURL} alt="Profile image" className="w-full h-full object-cover"></img>
                                <div className="absolute inset-0 bg-myback2/10 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files.length > 0) {
                                                uploadProfileImage(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-white text-myback2 font-semibold rounded-lg shadow duration-200 ease-in-out hover:bg-myback hover:text-white cursor-pointer">
                                        Change Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='relative w-full h-full flex items-center justify-center text-myback2 text-7xl font-semibold group'>
                                <p>{newNameFirstLetter}</p>
                                <div className="absolute inset-0 bg-myback2/10 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files.length > 0) {
                                                uploadProfileImage(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <button onClick={() => fileInputRef.current.click()} className="text-lg px-4 py-2 bg-white text-myback2 font-semibold rounded-lg shadow duration-200 ease-in-out hover:bg-myback hover:text-white cursor-pointer">
                                        Change Image
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 w-full p-5">
                        <div className="flex w-full items-center justify-between">
                            <input disabled={!changeNameSurnameToggle} className={`text-2xl max-w-3/4 p-2 pl-3 outline-0  ${changeNameSurnameToggle && 'border-2 border-white rounded-lg'}`} type="text" value={newNameSurname} onChange={(e) => setNewNameSurname(e.target.value)} />
                            {!changeNameSurnameToggle ? (
                                <img onClick={() => setChangeNameSurnameToggle(true)} className="w-5 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/change.png" alt="change" />
                            ) : (
                                <div className="flex gap-2 items-center">
                                    <img onClick={() => { setChangeNameSurnameToggle(false); setNewNameSurname(user.nameSurname) }} className="w-8 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/cancel.png" alt="cancel" />
                                    <img onClick={changeNameSurname} className="w-7 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/copied.png" alt="change" />
                                </div>
                            )}
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <input disabled={!newUsernameToggle} className={`text-lg opacity-50 max-w-3/4 p-1 pl-3 outline-0  ${newUsernameToggle && 'border-2 border-white rounded-lg opacity-100'}`} type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                            {!newUsernameToggle ? (
                                <img onClick={() => setNewUsernameToggle(true)} className="w-5 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/change.png" alt="change" />
                            ) : (
                                <div className="flex gap-2 items-center">
                                    <img onClick={() => { setNewUsernameToggle(false); setNewUsername(user.username) }} className="w-8 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/cancel.png" alt="cancel" />
                                    <img onClick={changeUsername} className="w-7 cursor-pointer duration-200 ease-in-out hover:scale-110" src="/copied.png" alt="change" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="absolute p-5 bottom-0 flex w-full">
                        <div onClick={() => navigate('/login')} className="flex gap-2 w-full p-3 items-center justify-baseline rounded-lg duration-200 ease-in-out hover:bg-myback2 cursor-pointer">
                            <img className="w-5" src="/leave2.png" alt="logout" />
                            <p>Log out</p>
                        </div>
                    </div>
                </div>
            )}
            {securitySettings && (
                <div className="w-full h-full absolute bg-myback z-200 font-roboto text-white">
                    <div className='pl-5 flex gap-5 justify-baseline items-center w-full h-1/12'>
                        <img onClick={() => setSecuritySettings(false)} className='w-5 cursor-pointer duration-200 ease-in-out hover:scale-105' src="/close.png" alt="close" />
                        <p className='font-semibold text-xl'>Security settings</p>
                    </div>
                    <div className="flex w-full flex-col gap-2 p-5 bg-myback">
                        <div className="flex gap-2 items-center justify-baseline mb-3">
                            <img className="w-5" src="/password.png" alt="password" />
                            <p className="text-lg font-semibold">Change password</p>
                        </div>
                        <div className="flex flex-col gap-5 pl-5">
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold cursor-pointer" htmlFor="oldpass">Old password</label>
                                <input value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} id="oldpass" className="w-full border-2 border-white p-2 rounded-lg outline-0 pl-3" type="password" placeholder="Enter old password" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold cursor-pointer" htmlFor="newpass">New password</label>
                                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} id="newpass" className="w-full border-2 border-white p-2 rounded-lg outline-0 pl-3" type="password" placeholder="Enter new password" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold cursor-pointer" htmlFor="confnewpass">Confirm new password</label>
                                <input value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} id="confnewpass" className="w-full border-2 border-white p-2 rounded-lg outline-0 pl-3" type="password" placeholder="Confirm new password" />
                            </div>
                        </div>
                        <div className="flex justify-center items-center p-5">
                            <div onClick={changePassword} className="p-3 pl-5 pr-5 border-2 rounded-xl duration-200 ease-in-out hover:bg-white hover:text-myback cursor-pointer">
                                Change password
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {newChatDialog && (
                <div onClick={() => setNewChatDialog(false)} className="absolute flex justify-center items-center top-0 left-0 w-screen h-screen bg-black50 z-50">
                    <NewChat onChatCreated={() => {
                        fetchChats();

                        setNewChatDialog(false);
                    }} />
                </div>
            )}
            {joinChatDialog && (
                <div onClick={() => setJoinChatDiaog(false)} className="absolute flex justify-center items-center top-0 left-0 w-screen h-screen bg-black50 z-50">
                    <JoinChat onJoinedChat={() => {
                        fetchChats();
                        setJoinChatDiaog(false);
                    }} />
                </div>
            )}
            <div className="w-full flex justify-between items-end p-5 font-roboto font-bold text-2xl text-white">
                <div className="flex gap-3 justify-center items-center">
                    <img onClick={() => { setUserMenu(!userMenu); }} className="w-5 cursor-pointer duration-200 ease-in-out hover:scale-105" src="/menu.png" alt="" />
                    <p>Chats</p>
                </div>
                <div className="flex gap-3">
                    <div onClick={() => setNewChatDialog(true)} className="cursor-pointer duration-200 ease-in-out hover:scale-105">
                        <img className="w-7" src="/group.png" alt="group" />
                    </div>
                    <div onClick={() => setJoinChatDiaog(true)} className="cursor-pointer duration-200 ease-in-out hover:scale-105">
                        <img className="w-7" src="/join.png" alt="group" />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-1 custom-scrollbar">
                {chats && chats.length > 0 ? (
                    chats.map((chat) => {
                        return (
                            <div onClick={() => setSelectedChat(chat)} key={chat._id} className={`w-full min-h-21 flex items-center pl-3 gap-3 duration-200 ease-in-out cursor-pointer
                                                         rounded-2xl  ${selectedChat && selectedChat._id === chat._id ? 'bg-myback2' : 'hover:bg-black50'}`}>
                                <div className="min-w-13 h-13 bg-white flex justify-center items-center rounded-full">
                                    {chat.backgroundImage ? (
                                        <div className="w-13 h-13 bg-myback flex justify-center items-center rounded-full">
                                            <img className="w-13 h-13 object-cover rounded-full" src={chat.backgroundImage.url} alt="chatimg" />
                                        </div>
                                    ) : (
                                        <img className="w-5" src="group-chat.png" alt="" />
                                    )}
                                </div>
                                <div className="w-full flex flex-col h-15 justify-center font-roboto font-normal text-white pr-3">
                                    <div className="flex justify-between items-center">
                                        <p>{chat.title}</p>
                                        <p className="text-xs ">{chat.messages.length > 0 && formatMessageDate(chat.messages[chat.messages.length - 1].createdAt)}</p>
                                    </div>
                                    <p className="text-sm opacity-80 truncate max-w-[12rem]">
                                        {chat.messages && chat.messages.length > 0
                                            ? `${chat.messages[chat.messages.length - 1].sentBy.username}: ${chat.messages[chat.messages.length - 1].body}`
                                            : 'No messages yet'}
                                    </p>
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