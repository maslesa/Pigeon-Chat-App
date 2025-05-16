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

module.exports = {
    uploadToCloudinary,
}