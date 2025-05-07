const jwt = require('jsonwebtoken');

const isLoggedIn = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({
            success: false,
            message: 'You have to login to enter this page'
        })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
        req.userInfo = decodedToken;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }
}

module.exports = isLoggedIn;

