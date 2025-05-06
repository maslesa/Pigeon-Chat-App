const mongoose = require('mongoose');

const connectToDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('succcessfully connected to mongodb!');
    } catch (error) {
        console.log('Error connecting to mongodb: ', error);
        process.exit(1);
    }
}

module.exports = connectToDB;