const { uploadToCloudinary } = require('../helpers/cloudinary-helper');
const ProfileImage = require('../models/ProfileImage');
const User = require('../models/User');

const uploadProfileImage = async(req, res) => {
    try {
        //check if file is missing in req
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: 'file is required, please upload an image'
            })
        }

        //upload to cloudinary
        const {url, public_id} = await uploadToCloudinary(req.file.path);

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

module.exports = {
    uploadProfileImage,
}