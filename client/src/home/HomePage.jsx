import Header from "../components/Header"
import Chats from "../components/Chats"

export default function HomePage(){

    return(
        <div className="w-screen h-screen bg-myback2 flex flex-col justify-baseline items-center">
            <Header />
            <div className="w-full flex-1 flex justify-baseline bg-mylight">
                <Chats />
            </div>
        </div>
    )

}