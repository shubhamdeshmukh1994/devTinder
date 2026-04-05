const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const { errorHandler } = require("../middleware/error");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.use(express.json());
profileRouter.use(errorHandler);


profileRouter.get("/profile/view", userAuth, async function(req,res){
	try {
		const user = req.user;
		if(!user) {
			return res.status(404).send("User not found");
		}
		res.send({user : user});	
	} catch(err) {
		console.log("Error logging in user", error);
		res.status(500).send("Error logging in user");	
	}
});

profileRouter.patch("/profile/edit", userAuth, async function(req,res){
	try {
        const body = req?.body;
        if(!validateEditProfileData(body)) {
            return res.status(400).send("Invalid data");
        }
        const user = req.user;
		if(!user) {
			return res.status(404).send("User not found");
		}
        const loggedInUser = req.user;

        Object.keys(body).forEach(key => {
            loggedInUser[key] = body[key];
        });
        await loggedInUser.save();

		res.send({
            message: "Profile updated successfully",
            user: loggedInUser
        });	
	} catch(err) {
		console.log("Error logging in user", error);
		res.status(500).send("Error logging in user");	
	}
});

module.exports = profileRouter;