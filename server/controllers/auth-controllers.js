const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRegister = async (req, res) => {
    try {
        const { nameSurname, username, password } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(401).json({
                success: false,
                message: 'User with that username already exists'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            nameSurname: nameSurname,
            username: username,
            password: hashedPassword,
        });

        await newUser.save();

        if (newUser) {
            res.status(200).json({
                success: true,
                message: 'User registered successfully',
                data: newUser
            })
        } else {
            res.status(400).json({
                success: false,
                message: 'User could not be created'
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username }).populate('profileImage');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User with that username does not exist'
            })
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            return res.status(404).json({
                success: false,
                message: 'Incorrect password'
            })
        }

        const token = jwt.sign({
            id: user._id,
            nameSurname: user.nameSurname,
            username: user.username,
        }, process.env.JWT_TOKEN, {
            expiresIn: '1h'
        });

        res.status(200).json({
            success: true,
            message: 'user logged in successfully',
            data: user,
            token: token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: 'old password or new password is undefined'
            })
        }

        const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!strongPasswordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long, include a number and an uppercase letter.'
            });
        }

        const userId = req.userInfo.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User with that ID not found'
            })
        }

        //check if old password is match
        const passwordMatches = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatches) {
            return res.status(400).json({
                success: false,
                message: 'Old password is incorrect'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password is updated successfully'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const changeNameSurname = async(req, res) => {
    try {
        const {newNameSurname} = req.body;

        if(!newNameSurname || newNameSurname.length < 4){
            return res.status(400).json({
                success: false,
                message: 'New nameSurname invalid format'
            })
        }


        const userId = req.userInfo.id;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User with that Id is not found'
            })
        }

        user.nameSurname = newNameSurname;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'NameSurname updated successfully'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const changeUsername = async(req, res) => {
    try {
        const {newUsername} = req.body;
        const userId = req.userInfo.id;
        const user = await User.findById(userId);

        if(user.username === newUsername){
            return res.status(200).json({
                success: true,
                message: 'Username updated successfully'
            })
        }

        const usernameExists = await User.findOne({
            username : newUsername
        });

        if(usernameExists){
            return res.status(400).json({
                success: false,
                message: 'User with that username already exists'
            })
        }

        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User with that Id is not found'
            })
        }

        user.username = newUsername;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Username updated successfully'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

module.exports = {
    userRegister,
    userLogin,
    changePassword,
    changeNameSurname,
    changeUsername,
}