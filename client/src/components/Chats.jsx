

export default function Chats(){

    return(
        <div className="w-1/3 h-full flex flex-col items-center bg-myback shadow-2xl">
            <div className="w-5/6 flex justify-between items-end p-5 font-roboto font-bold text-3xl text-white border-b-3 border-white"> 
                <p>Chats</p>
                <div className="flex gap-3">
                    <div className="cursor-pointer duration-200 ease-in-out hover:scale-105">
                        <img className="w-7" src="/group.png" alt="group" />
                    </div>
                    <div className="cursor-pointer duration-200 ease-in-out hover:scale-105">
                        <img className="w-7" src="/join.png" alt="group" />
                    </div>
                </div>
            </div>
            <div className="w-5/6 flex-1 flex flex-col gap-2 pt-5 overflow-y-auto
                            scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                
            </div>
        </div>
    );

}