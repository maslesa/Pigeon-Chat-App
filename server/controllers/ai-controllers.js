const AIMessage = require('../models/AIMessages');
const User = require('../models/User');

const sendAIMessage = async (req, res) => {
    try {
        const userId = req.userInfo.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found',
            })
        }

        const { messageBody } = req.body;

        const newAIMessage = new AIMessage({
            user: userId,
            body: messageBody,
            isAI: false,
        });

        await newAIMessage.save();

        return res.status(200).json({
            success: true,
            message: 'message sent successfully',
            aimessage: newAIMessage
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        });
    }
}

const fetchUsersMessages = async (req, res) => {
    try {
        const userId = req.userInfo.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            })
        }

        const allMessages = await AIMessage.find({ user: userId });

        if (!allMessages) {
            return res.status(400).json({
                success: false,
                message: 'could not fetch ai messages'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'messages fetched successfully',
            chat: allMessages
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        });
    }
}



module.exports = {
    sendAIMessage,
    fetchUsersMessages
}