


export default function Chat({selectedChat}){

    return(
        <>
        {selectedChat && (
            <>
            <div className="flex flex-col flex-1 bg-myback2 justify-baseline items-center">
                <div className="w-full h-21 bg-myback flex gap-3 items-center justify-baseline pl-10 pr-10 shadow-lg">
                    <div className="w-15 h-15 bg-white flex justify-center items-center rounded-full">
                        {selectedChat.backgroundImage ? (
                            <div>
                                SL
                            </div>
                        ) : (
                            <img className="w-7" src="group-chat.png" alt="" />
                        )}
                    </div>
                    <div className="flex flex-col h-15 justify-baseline font-roboto font-normal pt-1 text-white text-xl">
                        <p className="cursor-pointer duration-200 ease-in-out hover:scale-101">{selectedChat.title}</p>
                        <div className="text-sm opacity-50">{
                            selectedChat.members.length === 1 ? (
                                <div>{selectedChat.members.length} member</div>
                            ) : (
                                <div>{selectedChat.members.length} members</div>
                            )    
                        }</div>
                    </div>
                </div>
                <div className="w-full h-4/5">

                </div>
                <div className="w-full h-1/7 flex gap-5 justify-center items-center">
                        <input className="w-2/3 h-1/2 border-2 border-white rounded-xl outline-0
                                            font-roboto pl-5 items-center text-white" autoComplete="off" type="text" />
                        <div className="cursor-pointer duration-200 ease-in-out hover:scale-110">
                            <img className="w-7" src="/send.png" alt="" />
                        </div>
                </div>
            </div>
            
            </>
        )}
        </>
        
    )

}