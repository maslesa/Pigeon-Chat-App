const { uploadToCloudinary } = require('../helpers/cloudinary-helper');
const ProfileImage = require('../models/ProfileImage');
const User = require('../models/User');
const Chat = require('../models/Chat');
const ChatImage = require('../models/ChatImage');
const cloudinary = require('../config/cloudinary');

const uploadProfileImage = async (req, res) => {
    try {
        //check if file is missing in req
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'file is required, please upload an image'
            })
        }

        //upload to cloudinary
        const { url, public_id } = await uploadToCloudinary(req.file.path);

        const userId = req.userInfo.id;
        const user = await User.findById(userId);

        //store the image url and public id in db
        const newProfileImage = new ProfileImage({
            url: url,
            public_id: public_id,
            uploadedBy: userId,
        })

        await newProfileImage.save();

        user.profileImage = newProfileImage._id;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'profile image uploaded successfully',
            image: newProfileImage
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'smt went wrong'
        })
    }
}

const uploadChatImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'file is missing'
            })
        }

        //upload to cloudinary
        const { url, public_id } = await uploadToCloudinary(req.file.path);

        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'chat with that id not found'
            })
        }

        const newChatImage = new ChatImage({
            url: url,
            public_id: public_id,
            chat: chatId
        });

        await newChatImage.save();

        chat.backgroundImage = newChatImage._id;
        await chat.save();

        res.status(200).json({
            success: true,
            message: 'chat image uploaded successfully',
            chatImage: newChatImage,
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'smt went wrong'
        })
    }
}

const deleteProfileImage = async (req, res) => {
    try {
        const imageId = req.params.profileImageId;
        const userId = req.userInfo.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            })
        }

        const image = await ProfileImage.findById(imageId);
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'image not found'
            })
        }

        if (image.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'you are not authorized to delete this image'
            })
        }

        await cloudinary.uploader.destroy(imageId);

        await ProfileImage.findByIdAndDelete(imageId);

        user.profileImage = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'smt went wrong'
        })
    }
}

const deleteChatImage = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'chat not found'
            })
        }

        const { imageId } = req.body;
        const chatImage = await ChatImage.findById(imageId);

        if(!chatImage){
            return res.status(404).json({
                success: false,
                message: 'image not found'
            })
        }

        await cloudinary.uploader.destroy(imageId);

        await ChatImage.findByIdAndDelete(imageId);

        chat.backgroundImage = null;
        await chat.save();

        res.status(200).json({
            success: true,
            message: 'chat image deleted successfully'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'smt went wrong'
        })
    }
}

module.exports = {
    uploadProfileImage,
    uploadChatImage,
    deleteProfileImage,
    deleteChatImage,
}