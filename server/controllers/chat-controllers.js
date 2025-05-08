const Chat = require('../models/Chat');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

function generatePasscode(length = 8) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}


const chatCreate = async(req, res) => {
    try {
        const {title} = req.body;
        const userId = req.userInfo.id;

        const passcode = generatePasscode();
        const salt = await bcrypt.genSalt(10);
        const hashedPasscode = await bcrypt.hash(passcode, salt);

        const newChat = new Chat({
            title: title,
            passcode: hashedPasscode,
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

const chatFetchAll = async(req, res) => {
    try {
        const userId = req.userInfo.id;

        const chats = await Chat.find({members: userId});

        if(chats.length === 0){
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

const chatJoin = async(req, res) => {
    try {
        const userId = req.userInfo.id;
        const chatId = req.params.chatId;
        const {passcode} = req.body;

        const chat = await Chat.findById(chatId);

        const passcodeMatches = await bcrypt.compare(passcode, chat.passcode);

        if(!passcodeMatches){
            return res.status(401).json({
                success: false,
                message: 'Incorrect passcode'
            })
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {$addToSet : { members: userId }},
            {new: true}
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



module.exports = {
    chatCreate,
    chatFetchAll,
    chatJoin
}