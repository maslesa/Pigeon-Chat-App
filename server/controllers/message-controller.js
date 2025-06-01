const { uploadToCloudinary, uploadBase64ToCloudinary } = require('../helpers/cloudinary-helper');
const Chat = require('../models/Chat');
const Image = require('../models/Image');
const Message = require('../models/Message');

const createMessage = async ({ chatId, userId, message, base64Image }) => {
    try {
        let file_id = null;

        if (base64Image) {
            const uploaded = await uploadBase64ToCloudinary(base64Image);
            if (!uploaded) throw new Error('Cloudinary upload failed');

            const { url, public_id } = uploaded;

            const image = await Image.create({
                url,
                public_id,
                sentBy: userId
            });

            file_id = image._id;
        }

        const newMessage = await Message.create({
            body: message,
            sentBy: userId,
            chat: chatId,
            image: file_id
        });

        await Chat.findByIdAndUpdate(chatId, {
            $push: {
                messages: newMessage._id,
                images: file_id,
            }
        });

        const populatedMessage = await Message.findById(newMessage._id)
            .populate({
                path: 'sentBy',
                populate: { path: 'profileImage', model: 'ProfileImage' }
            })
            .populate('image');

        return populatedMessage;

    } catch (error) {
        console.error('Error creating message:', error.message);
        throw error;
    }
};

const fetchAllMessages = async (req, res) => {
    try {
        const chatId = req.params.chatId;

        const messages = await Message.find({ chat: chatId })
            .populate({
                path: 'sentBy',
                populate: {
                    path: 'profileImage',
                    model: 'ProfileImage',
                }
            })
            .populate({
                path: 'image',
                populate: {
                    path: 'sentBy',
                    populate: {
                        path: 'profileImage',
                        model: 'ProfileImage',
                    }
                }
            })
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'smt went wrong'
        });
    }
};

module.exports = {
    createMessage,
    fetchAllMessages
}