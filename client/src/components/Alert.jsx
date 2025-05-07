import { useEffect, useState } from "react"


const Alert = ({message, isError, duration = 3000, onClose}) => {

    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);

    }, [duration, onClose]);

    if(!visible) return null;

    const bgColor = isError ? "bg-red-700" : "bg-green-600";

    return (
        <div className={`fixed top-5 right-5 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`}>
          {message}
        </div>
    );
}

export default Alert;