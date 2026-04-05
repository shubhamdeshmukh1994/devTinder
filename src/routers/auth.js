const express = require("express");
const authRouter = express.Router();
const bycrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const User = require("../models/user");
const { validateSingUpData } = require("../utils/validation");
const { errorHandler } = require("../middleware/error");

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
			res.cookie("token", token, {
				httpOnly: true,
				expires: new Date(Date.now() + 24 * 3600000)
			});
			res.send({
				message: "Login successful",
				token
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
		const user = new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			emailId: req.body.emailId,
			password: hashedPassword,
			phone: req.body.phone
		});

		let data = await user.save();
		console.log("User created",data);
		res.send("post request to users");
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

module.exports = authRouter;