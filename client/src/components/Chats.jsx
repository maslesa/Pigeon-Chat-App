

export default function Chats(){

    return(
        <div className="w-1/3 h-full flex flex-col items-center bg-myback shadow-2xl">
            <div className="w-5/6 flex justify-center p-7 font-roboto font-bold text-3xl text-white border-b-3 border-white"> 
                <p>Chats</p>
            </div>
            <div className="w-5/6 flex-1 flex flex-col gap-2 pt-5 overflow-y-auto
                            scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                <div className="flex gap-3 w-full h-1/7 border-2 border-t-0 justify-between">
                    <div className="flex w-1/5 justify-center items-center p-3">
                        <div className="w-full h-full bg-mylight flex justify-center items-center rounded-full">
                            C
                        </div>
                    </div>
                    <div className="flex w-4/5 bg-amber-400">

                    </div>
                </div>
                
            </div>
        </div>
    );

}