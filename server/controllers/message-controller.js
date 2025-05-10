const Chat = require('../models/Chat');
const Message = require('../models/Message');

const createMessage = async({chatId, userId, message}) => {
    try {
        const newMessage = await Message.create({
            body: message,
            sentBy: userId,
            chat: chatId,
        });

        await Chat.findByIdAndUpdate(
            chatId,
            { $push : { messages : newMessage._id } }
        )

        const populatedMessage = await newMessage.populate('sentBy', 'username');
        
        
        return populatedMessage;

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'smt went wrong'
        })
    }
}

module.exports = {
    createMessage,

}