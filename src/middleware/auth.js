const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        const {token} = req.cookies;
        if(!token) {
            return res.status(401).send("Unauthorized");
        }
        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
        const {_id, emailId} = decodedMessage;
        let user = await User.findById(_id);
        if(!user) {
            return res.status(404).send("User not found");
        }
        req.user = user; // Attach user information to the request object for downstream use
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.log("Error authenticating user", error);
        return res.status(500).send("Error authenticating user");
    }               
};

module.exports = {
    userAuth
}