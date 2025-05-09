const Chat = require('../models/Chat');

const isChatMember = async(req, res, next) => {
    const chatId = req.params.chatId;
    const userId = req.userInfo.id;

    if(!userId || !chatId){
        return res.status(400).json({
            success: false,
            message: 'UserID or ChatID are not found'
        });
    }

    try {
        const isMember = await Chat.findOne({
            _id: chatId,
            members : userId
        });

        if(!isMember){
            return res.status(404).json({
                success: false,
                message: 'You are not a member of this chat'
            })
        }

        next();

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: 'Membership error'
        })
    }
}

module.exports = {
    isChatMember,
}