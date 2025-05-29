const AIMessage = require('../models/AIMessages');
const User = require('../models/User');

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.PIDGEY_OPENAI_KEY });

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

        const userMessage = new AIMessage({
            user: userId,
            body: messageBody,
            isAI: false,
        });
        await userMessage.save();

        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful AI assistant called Pidgey. You are chatbot in chat app.' },
                { role: 'user', content: messageBody }
            ]
        })
        const aiText = aiResponse.choices[0].message.content;

        const aiMessage = new AIMessage({
            user: userId,
            body: aiText,
            isAI: true,
        });
        await aiMessage.save();

        return res.status(200).json({
            success: true,
            message: 'message sent and ai responded successfully',
            chat: [userMessage, aiMessage]
        });

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