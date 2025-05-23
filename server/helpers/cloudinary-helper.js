const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async(filePath) => {
    try {
        const res = await cloudinary.uploader.upload(filePath);

        return {
            url: res.secure_url,
            public_id: res.public_id,
        }
    } catch (error) {
        console.log('error while uploading to cloudinary', error);
    }
}

const uploadBase64ToCloudinary = async (base64String) => {
    try {
        if (!base64String.startsWith('data:image')) {
            throw new Error('Invalid base64 image format');
        }

        const res = await cloudinary.uploader.upload(base64String, {
            folder: 'chatImages',
            resource_type: 'image',
        });

        return {
            url: res.secure_url,
            public_id: res.public_id,
        };
    } catch (error) {
        console.error('Error uploading base64 image to Cloudinary:', error.message);
        return null;
    }
};

module.exports = {
    uploadToCloudinary,
    uploadBase64ToCloudinary
}