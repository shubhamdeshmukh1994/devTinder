const express = require("express");
const authRouter = express.Router();
const bycrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const User = require("../models/user");
const { validateSingUpData } = require("../utils/validation");
const { errorHandler } = require("../middleware/error");
const { getUserAvatar } = require("../utils/helper");

// app.use(); router.use() this both are same
//The ExpressJSon() middleware is applied to parse incoming JSON request bodies, making the data accessible via req.body.
authRouter.use(express.json());
authRouter.use(errorHandler);
authRouter.use(cookieParser());

authRouter.post("/users/login", async function(req,res){
	let { emailId, password } = req.body;
	try {
		if(!validator.isEmail(emailId)) {
			return res.status(400).send("Invalid email");
		}
		let user = await User.findOne({ emailId });
		if(!user) {
			return res.status(404).send("User not found");
		}
		console.log("User found", user);
		const isPasswordMatch = await user.validatePassword(password);
		if(isPasswordMatch) {
			const token = await user.getJwtToken();
			//set and send cookie with token
            console.log("res.cookie", res.cookie);
			res.cookie("token", token, {
				httpOnly: true,
				expires: new Date(Date.now() + 24 * 3600000)
			});
            console.log("res.cookie", res.cookie);
			res.send({
				message: "Login successful",
				token,
				firstName: user?.firstName,
				lastName: user?.lastName,
				emailId: user?.emailId,
				phone: user?.phone,
				id: user._id,
				profilePicture: user?.profilePicture || await getUserAvatar(user?.firstName, user?.lastName),
				skills: user?.skills,
				about: user?.about,
				age: user?.age,
				gender:user?.gender
			});	
		} else {
			res.status(401).send("Invalid credentials");
		}
	} catch (error) {
		console.log("Error logging in user", error);
		res.status(500).send("Error logging in user");	
	}	
});

authRouter.post("/users/signup", async function(req,res){
	try {
		validateSingUpData(req.body);
		const { password } = req.body;
		const saltRounds = 10;
		const hashedPassword = await bycrypt.hash(password, saltRounds);
		console.log("Hashed password", hashedPassword);
		if(!req.body.profilePicture) {
			req.body.profilePicture = await getUserAvatar(req.body.firstName, req.body.lastName);
		}
		const user = new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			emailId: req.body.emailId,
			password: hashedPassword,
			phone: req.body.phone,
			profilePicture: req.body.profilePicture
		});

		let data = await user.save();
		const token = await data.getJwtToken();
		res.cookie("token", token, {
			httpOnly: true,
			expires: new Date(Date.now() + 24 * 3600000)
		});
		res.send({
			"message": "User Signed Up successfully",
			"data":data
		});
	} catch (error) {
		console.log("Error validating user data", error);
		return res.status(500).send("Error validating user data");
	}

	//validation for required fields
	// Encrypt password

	
});

authRouter.post("/users/logout", async function(req,res){
    try {
        res.clearCookie("token", null, {
                expires: new Date(Date.now())
            }
        );   
        res.send("Logout successful");
    } catch (error) {
        console.log("Error logging out user", error);
        res.status(500).send("Error logging out user");     
    }
});

authRouter.post("/users/reset-password", async function(req,res){
    try {
        const { emailId, newPassword } = req.body;
        if(!validator.isEmail(emailId)) {
            return res.status(400).send("Invalid email");
        }
        let user = await User.findOne({ emailId });
        if(!user) {
            return res.status(404).send("User not found");
        }
        const saltRounds = 10;
        const hashedPassword = await bycrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        await user.save();
        res.send("Password reset successful");
    } catch (error) {
        console.log("Error resetting password", error);
        res.status(500).send("Error resetting password");     
    }           
});
module.exports = authRouter;