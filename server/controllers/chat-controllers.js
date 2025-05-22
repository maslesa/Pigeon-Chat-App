const Chat = require('../models/Chat');
const Message = require('../models/Message');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { createMessage } = require('./message-controller');

function generatePasscode(length = 16) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}


const chatCreate = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.userInfo.id;

        const passcode = generatePasscode();

        const newChat = new Chat({
            title: title,
            passcode: passcode,
            members: [userId],
            admins: [userId],
        });

        const savedChat = await newChat.save();

        res.status(200).json({
            success: true,
            message: 'Chat created successfull',
            chat: savedChat,
            originalPasscode: passcode
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const chatFetchAll = async (req, res) => {
    try {
        const userId = req.userInfo.id;

        const chats = await Chat.find({ members: userId })
            .populate({
                path: 'messages',
                select: 'body createdAt sentBy',
                populate: {
                    path: 'sentBy',
                    select: 'username _id'
                }
            })
            .populate({
                path: 'backgroundImage',
                select: 'url public_id'
            });

        if (chats.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No chats found',
                chats: []
            })
        }

        res.status(200).json({
            success: true,
            chats: chats
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const chatJoin = async (req, res) => {
    try {
        const userId = req.userInfo.id;
        const chatId = req.params.chatId;
        const { passcode } = req.body;

        const chat = await Chat.findById(chatId);

        const passcodeMatches = chat.passcode === passcode;

        if (!passcodeMatches) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect passcode'
            })
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $addToSet: { members: userId } },
            { new: true }
        )

        if (!updatedChat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Joined chat successfully',
            chat: updatedChat,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const sendMessage = async (req, res) => {
    try {
        const userId = req.userInfo.id;
        const chatId = req.params.chatId;
        const message = req.body.message;
        let file = req.file || null;

        const newMessage = await createMessage({ chatId, userId, message, file });

        res.status(200).json({
            success: true,
            message: 'Message has been sent successfully',
            data: newMessage,
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const leaveChat = async (req, res) => {
    try {
        const userId = req.userInfo.id;
        const chatId = req.params.chatId;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        chat.members.pull(userId);
        chat.admins.pull(userId);

        await chat.save();

        if (chat.members.length === 0) {
            await Chat.findByIdAndDelete(chatId);
            return res.status(200).json({
                success: true,
                message: 'Chat deleted because there is no more members',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User left the chat successfully',
            chat,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        });
    }
};

const fetchMembers = async (req, res) => {
    try {
        const chatId = req.params.chatId;

        const chat = await Chat.findById(chatId)
            .populate({
                path: 'members',
                populate: {
                    path: 'profileImage'
                }
            })

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Error finding members'
            })
        }

        res.status(200).json({
            success: true,
            members: chat.members,
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        });
    }
}

const changeTitle = async(req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId);

        if(!chat){
            return res.status(404).json({
                success: false,
                message: 'chat with that Id not found'
            })
        }

        const {newTitle} = req.body;

        if(newTitle.length < 3){
            return res.status(400).json({
                success: false,
                message: 'title has to be min 3 chars long'
            })
        }

        chat.title = newTitle;
        await chat.save();

        res.status(200).json({
            success: true,
            message: 'chat title updated succcessfully'
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
    chatCreate,
    chatFetchAll,
    chatJoin,
    sendMessage,
    leaveChat,
    fetchMembers,
    changeTitle,
}